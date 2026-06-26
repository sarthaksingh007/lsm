import { Response } from 'express';
import { Application } from '../models/Application';
import { runBRE } from '../services/bre.service';
import { AuthedRequest } from '../types';
import { PersonalDetailsInput } from '../validators/schemas';

export async function submitPersonalDetails(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

  // Body is already validated/coerced by validateBody(personalDetailsSchema).
  const { fullName, pan, dob, monthlySalary, employmentMode } =
    req.body as PersonalDetailsInput;

  const bre = runBRE({ pan, dob, monthlySalary, employmentMode });
  if (!bre.ok) {
    return res.status(422).json({ message: 'BRE rejected', errors: bre.errors });
  }

  const existing = await Application.findOne({ user: req.user.userId });
  const update = {
    user: req.user.userId,
    fullName,
    pan: pan.toUpperCase(),
    dob: new Date(dob),
    monthlySalary,
    employmentMode,
    breCleared: true,
  };

  const application = existing
    ? await Application.findOneAndUpdate({ _id: existing._id }, update, { new: true })
    : await Application.create(update);

  return res.status(existing ? 200 : 201).json({ application });
}

export async function uploadSlip(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const application = await Application.findOne({ user: req.user.userId });
  if (!application) {
    return res
      .status(400)
      .json({ message: 'Submit personal details before uploading salary slip' });
  }
  application.salarySlipPath = req.file.filename;
  await application.save();

  return res.json({
    application,
    file: { filename: req.file.filename, size: req.file.size },
  });
}

export async function myApplication(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
  const application = await Application.findOne({ user: req.user.userId });
  return res.json({ application });
}
