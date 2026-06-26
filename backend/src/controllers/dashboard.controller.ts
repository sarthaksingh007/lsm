import { Response } from 'express';
import { User } from '../models/User';
import { Application } from '../models/Application';
import { Loan } from '../models/Loan';
import { AuthedRequest } from '../types';

// Sales: registered borrowers who have not yet submitted an application.
export async function salesLeads(_req: AuthedRequest, res: Response) {
  const borrowers = await User.find({ role: 'borrower' }).select(
    '-passwordHash'
  );
  const apps = await Application.find().select('user');
  const appliedIds = new Set(apps.map((a) => a.user.toString()));
  const loans = await Loan.find().select('user');
  const loanIds = new Set(loans.map((l) => l.user.toString()));

  const leads = borrowers
    .filter(
      (b) => !appliedIds.has(b._id.toString()) || !loanIds.has(b._id.toString())
    )
    .map((b) => ({
      id: b._id,
      name: b.name,
      email: b.email,
      createdAt: b.createdAt,
      hasApplication: appliedIds.has(b._id.toString()),
      hasLoan: loanIds.has(b._id.toString()),
    }));

  return res.json({ leads });
}
