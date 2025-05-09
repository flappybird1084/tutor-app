import express, { RequestHandler, Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt, { JwtPayload, JwtHeader, Secret, SignOptions } from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '@server/util';
import { User } from '@server/schemas';

export const adminRouter= express.Router();
dotenv.config();

adminRouter.get('/mainpage', async (req: Request, res: Response) => {
  if (req.user && req.user.role === 'admin') {
    // console.log('User is authenticated:', req.user);
    const userObject = await User.findById(req.user.sub);
    const email = userObject?.email;
    const username = userObject?.username;
    const role = userObject?.role;
    res.render('admin/admin', { user: req.user, email, username, role });
  }
  else{
    res.redirect('/auth/login');
  }
});
adminRouter.get('/users', async (req: Request, res: Response) => {
  if (req.user && req.user.role === 'admin') {
    const users= await User.find();
    res.render('admin/usermanagement', { users });
  }
  else{
    res.redirect('/auth/login');
  }
});