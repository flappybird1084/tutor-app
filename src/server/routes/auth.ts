import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { file } from '@server/util';

export const authRouter = express.Router();

// Render login form
authRouter.get('/login', (req: Request, res: Response) => {
  res.render(file('views/login'));
  file;
});

// Handle login form submission
authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Add authentication logic here
  res.send('Login logic not implemented');
});

// Render registration form
authRouter.get('/register', (req: Request, res: Response) => {
  res.render(file('views/register.ejs'));
});

// Handle registration form submission
authRouter.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Add registration logic here
  res.send('Registration logic not implemented');
});
