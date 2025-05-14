import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Assignment, User } from '@server/schemas';

export const adminRouter = express.Router();
dotenv.config();

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log(`Unauthenticated request to ${req.url} (admin protected)`);
    res.redirect('/');
  }
};

adminRouter.get('/mainpage', adminOnly, async (req: Request, res: Response) => {
  // console.log('User is authenticated:', req.user);
  const userObject = await User.findById(req.user.sub);
  const email = userObject?.email;
  const username = userObject?.username;
  const role = userObject?.role;
  res.render('admin/admin', { user: req.user, email, username, role });
});

adminRouter.get('/users', adminOnly, async (req: Request, res: Response) => {
  const users = await User.find();
  res.render('admin/user-management', { users });
});

adminRouter.get(
  '/assignments',
  adminOnly,
  async (req: Request, res: Response) => {
    const assignments = await Assignment.find();
    res.render('admin/assignments/assignments', { assignments });
    res.redirect('/auth/login');
  }
);

adminRouter.get(
  '/assignments/create',
  adminOnly,
  async (req: Request, res: Response) => {
    res.render('admin/assignments/create-assignment');
  }
);

adminRouter.post(
  '/assignments/create',
  adminOnly,
  async (req: Request, res: Response) => {
    const { dueDate } = req.body;
    const title = req.body.title;
    const description = req.body.description;
    // const dueDate = req.body.dueDate;
    const assignment = new Assignment({ title, description });
    await assignment.save();
    res.redirect('/admin/assignments');
  }
);

adminRouter.get(
  '/assignments/edit/:id',
  adminOnly,
  async (req: Request, res: Response) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).send('Assignment not found');
    }
    res.render('admin/assignments/edit-assignment', { assignment });
  }
);

adminRouter.post(
  '/assignments/edit/:id',
  adminOnly,
  async (req: Request, res: Response) => {
    const { dueDate } = req.body;
    const title = req.body.title;
    const description = req.body.description;
    const githubLink = req.body.githubLink;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).send('Assignment not found');
      return;
    }
    assignment.title = title;
    assignment.description = description;
    assignment.dueDate = dueDate;
    assignment.githubLink = githubLink;
    await assignment.save();
    res.redirect('/admin/assignments');
  }
);

adminRouter.delete(
  '/assignments/delete/:id',
  adminOnly,
  async (req: Request, res: Response) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).send('Assignment not found');
      return;
    }
    await assignment.deleteOne();
    res.send('Assignment deleted');
  }
);
