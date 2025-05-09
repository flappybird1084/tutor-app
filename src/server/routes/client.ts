// src/server/routes/auth.ts
import express, { RequestHandler, Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt, { JwtPayload, JwtHeader, Secret, SignOptions } from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '@server/util';
import { User } from '@server/schemas';

export const clientRouter = express.Router();
dotenv.config();

clientRouter.get('/profile', async (req: Request, res: Response) => {
  if (req.user) {
    // console.log('User is authenticated:', req.user);
    const userObject = await User.findById(req.user.sub);
    const email = userObject?.email;
    const username = userObject?.username;
    const role = userObject?.role;
    res.render('client/profile', { user: req.user, email, username, role });
  }
  else{
    res.redirect('/login');
  }
});

clientRouter.get("/profile/edit", async (req: Request, res: Response) => {
  if (req.user) {
    // console.log('User is authenticated:', req.user);
    const userObject = await User.findById(req.user.sub);
    const email = userObject?.email;
    const username = userObject?.username;
    const role = userObject?.role;
    res.render('client/profile-edit', { user: req.user, email, username, role });
  }
  else{
    res.redirect('/login');
  }
});

clientRouter.post("/profile/edit", async (req: Request, res: Response) => {
  const { email, username } = req.body;
  const userObject = await User.findById(req.user.sub);
  if (userObject) {
    userObject.email = email;
    userObject.username = username;
    userObject.role = userObject.role; // Keep the same role

    console.log(`about to update username: ${username}`);
    await userObject.save();
    console.log('Username updated successfully', userObject.username, userObject.email);
    res.redirect('/profile');
  } else {
    res.status(404).send('User not found');
  }
});
clientRouter.get('/studentpage', async (req: Request, res: Response) => {
  if (req.user) {
    // console.log('User is authenticated:', req.user);
    const userObject = await User.findById(req.user.sub);
    const email = userObject?.email;
    const username = userObject?.username;
    const role = userObject?.role;
    res.render('client/studentpage', { user: req.user, email, username, role });
  }
  else{
    res.redirect('/login');
  }
});
