// src/server/routes/auth.ts
import express, { RequestHandler, Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt, { JwtPayload, JwtHeader, Secret, SignOptions } from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '@server/util';
import { User } from '@server/schemas';

dotenv.config();

export const authRouter = express.Router();

// GET  /login  → show the login form
authRouter.get('/login', (req: Request, res: Response) => {
  res.render('auth/login');
});


// GET  /register  → show the registration form
authRouter.get('/register', (req: Request, res: Response) => {
  res.render('auth/register');

});


