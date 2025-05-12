import express, { RequestHandler, Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt, { JwtPayload, JwtHeader, Secret, SignOptions } from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '@server/util';
import { Assignment, User } from '@server/schemas';

export const adminRouter = express.Router();
dotenv.config();

adminRouter.get('/mainpage', async (req: Request, res: Response) => {
  if (req.user && req.user.role === 'admin') {
    // console.log('User is authenticated:', req.user);
    const userObject = await User.findById(req.user.sub);
    const email = userObject?.email;
    const username = userObject?.username;
    const role = userObject?.role;
    res.render('admin/admin', { user: req.user, email, username, role });
  } else {
    res.redirect('/auth/login');
  }
});
adminRouter.get('/users', async (req: Request, res: Response) => {
  if (req.user && req.user.role === 'admin') {
    const users = await User.find();
    res.render('admin/user-management', { users });
  } else {
    res.redirect('/auth/login');
  }
});

adminRouter.get('/assignments', async (req: Request, res: Response) => {
  if (req.user && req.user.role === 'admin') {
    const assignments = await Assignment.find();
    res.render('admin/assignments/assignments', { assignments });
  } else {
    res.redirect('/auth/login');
  }
});

adminRouter.get('/assignments/create', async (req: Request, res: Response) => {
  if (req.user && req.user.role === 'admin') {
    res.render('admin/assignments/create-assignment');
  } else {
    res.redirect('/auth/login');
  }
});

adminRouter.post('/assignments/create', async (req: Request, res: Response) => {
  if (req.user && req.user.role === 'admin') {
    const { dueDate } = req.body;
    const title = req.body.title;
    const description = req.body.description;
    // const dueDate = req.body.dueDate;
    const assignment = new Assignment({ title, description });
    await assignment.save();
    res.redirect('/admin/assignments');
  } else {
    res.redirect('/auth/login');
  }
});

adminRouter.get(
  '/assignments/edit/:id',
  async (req: Request, res: Response) => {
    if (req.user && req.user.role === 'admin') {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        res.status(404).send('Assignment not found');
      }
      res.render('admin/assignments/edit-assignment', { assignment });
    } else {
      res.redirect('/auth/login');
    }
  }
);

adminRouter.post(
  '/assignments/edit/:id',
  async (req: Request, res: Response) => {
    if (req.user && req.user.role === 'admin') {
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
    } else {
      res.redirect('/auth/login');
    }
  }
);

adminRouter.delete(
  '/assignments/delete/:id',
  async (req: Request, res: Response) => {
    if (req.user && req.user.role === 'admin') {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        res.status(404).send('Assignment not found');
        return;
      }
      await assignment.deleteOne();
      res.send('Assignment deleted');
    } else {
      res.send('Assignment not deleted');
    }
  }
);
