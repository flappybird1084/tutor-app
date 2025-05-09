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
    console.log('User is authenticated:', req.user);
    const userObject = await User.findById(req.user.sub);
    const email = userObject?.email;
    const username = userObject?.username;
    const role = userObject?.role;
    res.render('client/profile', { user: req.user, email, username, role });
  }
});
