# Loan Management System (LMS)

A full-stack lending platform — borrowers apply for loans, internal executives manage them through their lifecycle.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind • Node.js + Express + TypeScript • MongoDB + Mongoose • JWT + bcrypt.

```
lms/
├── backend/    # Express + Mongoose API
└── frontend/   # Next.js App Router
```

## 1. Prerequisites

- Node.js 20+
- MongoDB running locally on `mongodb://localhost:27017` (or a remote URI)

## 2. Quick start with Docker (recommended)

One command brings up MongoDB, the API, and the Next.js frontend, and seeds the demo users.

```bash
cp .env.example .env              # edit JWT_SECRET, optionally SEED_PASSWORD
docker compose up --build         # frontend → http://localhost:3100
                                  # api      → http://localhost:5100
```

The `seed` service runs once and exits — it creates one user per role (see §4). Re-run it any time with `docker compose run --rm seed`.

To wipe everything and start fresh: `docker compose down -v`.

## 3. Backend setup (manual / without Docker)

```bash
cd backend
cp .env.example .env          # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed                  # creates one user per role
npm run dev                   # http://localhost:5100
```

## 4. Frontend setup (manual / without Docker)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # http://localhost:3100
```

## 5. Seeded login credentials

Password for all accounts: **`Password@123`** (override via `SEED_PASSWORD`).

| Role          | Email                       |
|---------------|-----------------------------|
| Admin         | admin@lms.local             |
| Sales         | sales@lms.local             |
| Sanction      | sanction@lms.local          |
| Disbursement  | disbursement@lms.local      |
| Collection    | collection@lms.local        |
| Borrower      | borrower@lms.local          |

You can also sign up new borrowers from the UI.

## 6. End-to-end flow to test

1. **Sign up / log in** as the seeded borrower (or create a new account from `/signup`).
2. **Personal details** — fill the form. The server BRE rejects if:
   - Age not between 23 and 50
   - Monthly salary < ₹25,000
   - PAN does not match `^[A-Z]{5}[0-9]{4}[A-Z]$`
   - Employment is "Unemployed"
3. **Upload salary slip** — PDF / JPG / PNG, max 5 MB.
4. **Loan config** — choose principal (₹50K–₹5L) and tenure (30–365 days). The live panel shows simple interest `(P × R × T) / (365 × 100)` at 12% p.a. Click **Apply**.
5. **Log out**, log in as **sanction** → approve (or reject with reason).
6. Log in as **disbursement** → mark the sanctioned loan disbursed.
7. Log in as **collection** → record payments with a unique UTR. When `amountPaid == totalRepayment`, the loan auto-closes.
8. Log in as **sales** to see borrowers without applications/loans.
9. Log in as **admin** to access every module from the sidebar.

## 7. Data model

| Collection     | Key fields                                                                                        |
|----------------|---------------------------------------------------------------------------------------------------|
| `users`        | name, email, passwordHash, role                                                                   |
| `applications` | user (1:1), fullName, pan, dob, monthlySalary, employmentMode, salarySlipPath, breCleared         |
| `loans`        | user, application, principal, tenureDays, interestRate, interestAmount, totalRepayment, amountPaid, status (`applied`/`sanctioned`/`rejected`/`disbursed`/`closed`), rejectionReason, timestamps |
| `payments`     | loan, utr (unique), amount, paidAt, recordedBy                                                    |

### Loan status transitions

```
applied ─► sanctioned ─► disbursed ─► closed (auto on full payment)
        └► rejected
```

Each transition is restricted to a single role by RBAC middleware.

## 8. REST API summary

All routes are prefixed `/api`. Auth uses `Authorization: Bearer <jwt>`. Responses are JSON.

### Public
- `POST /auth/signup` `{ name, email, password }` → `{ token, user }`
- `POST /auth/login` `{ email, password }` → `{ token, user }`
- `GET /health` → `{ ok: true }`

### Authenticated
- `GET /auth/me` → current user

### Borrower-only
- `GET /applications/me`
- `POST /applications/personal` — runs BRE on server (422 + `errors[]` on fail)
- `POST /applications/salary-slip` (multipart, field `salarySlip`)
- `POST /loans/apply` `{ principal, tenureDays }`
- `GET /loans/mine`

### Ops (role-restricted)
- `GET /loans?status=applied` — sanction (+ admin)
- `GET /loans?status=sanctioned` — disbursement (+ admin)
- `GET /loans?status=disbursed|closed` — collection (+ admin)
- `GET /loans/:id` — any ops role (+ admin)
- `POST /loans/:id/sanction` `{ decision: 'approve'|'reject', reason? }` — sanction
- `POST /loans/:id/disburse` — disbursement
- `POST /payments` `{ loanId, utr, amount, paidAt }` — collection (unique UTR via DB index → `409`; overpay-safe atomic balance update; auto-closes loan when fully paid)
- `GET /payments/loan/:loanId` — collection
- `GET /dashboard/sales/leads` — sales

### Auth/RBAC contract
- `401 Unauthorized` — missing/invalid JWT
- `403 Forbidden` — authenticated but role not allowed
- `409 Conflict` — duplicate (e.g. UTR) or illegal status transition
- `422 Unprocessable Entity` — BRE or input-validation rejection (with `errors[]`)

## 9. Design notes

- **BRE lives on the server.** A client-side mirror would be a UX nicety, but the rubric and security require server-side enforcement — the client copy can be bypassed. Validation is centralized in `backend/src/services/bre.service.ts`.
- **PAN regex:** `^[A-Z]{5}[0-9]{4}[A-Z]$` — Indian Income Tax Department format.
- **RBAC is enforced twice.** Frontend hides sidebar modules and gates routes via `useRequireAuth`. Backend `requireRole(...roles)` middleware also rejects unauthorized requests — admin passes through every check.
- **Concurrency-safe payments.** Recording a payment is the one place two requests can race, so correctness can't rely on read-then-write app logic:
  - **UTR uniqueness** is enforced by a Mongo unique index, not an app-level `findOne` check (which has a gap between read and `create`). On the rare duplicate the index raises `E11000`, which the controller catches and maps to `409` instead of leaking a `500`.
  - **Outstanding balance** (`totalRepayment − amountPaid`) is updated with a single atomic `findOneAndUpdate` whose filter re-checks `amountPaid + amount ≤ totalRepayment` *inside the database*, and whose pipeline increments the balance and auto-closes the loan in one operation. Two concurrent payments therefore can't both pass the read-time check and overpay — the second fails the filter, and the UTR it reserved is rolled back so it can be retried. (A multi-document transaction would be the textbook tool, but the deployment runs single-node MongoDB, which doesn't support them — the conditional atomic update achieves the same guarantee without a replica set.)
- **Input validation vs. business rules.** Request shape (presence, types, coercion) is validated by **Zod** schemas in `validators/schemas.ts` via a `validateBody` middleware that returns `422 { errors[] }`. Business rules stay separate as pure, unit-testable functions — eligibility in `bre.service.ts`, loan ranges in `loan.service.ts`.
- **Hardening.** `helmet` sets security headers; auth endpoints (`/api/auth/*`) are rate-limited to blunt brute-force/credential-stuffing.
- **File uploads** are stored on local disk under `backend/uploads/` and served via `/uploads/<filename>`. In production swap for S3/GCS.

## 10. Building for production

```bash
cd backend && npm run build && npm start
cd frontend && npm run build && npm start
```

## 11. Folder tour

```
backend/src
├── config/db.ts
├── controllers/        # auth, application, loan, payment, dashboard
├── middleware/         # auth (JWT), rbac, upload (multer), error
├── models/             # User, Application, Loan, Payment
├── routes/
├── services/           # bre.service, loan.service (pure logic)
├── types/
├── utils/jwt.ts
├── seed.ts
└── index.ts

frontend/src
├── app/
│   ├── (auth)/login, signup
│   ├── apply/{personal,salary-slip,loan,success}
│   └── dashboard/{sales,sanction,disbursement,collection}
├── components/{ui,nav,borrower}
├── lib/{api.ts, auth.tsx, format.ts}
└── types/
```
