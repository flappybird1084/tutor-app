// src/server/routes/auth.ts
import express, {
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from 'express';
import dotenv from 'dotenv';
import jwt, {
  JwtPayload,
  JwtHeader,
  Secret,
  SignOptions,
  VerifyErrors,
} from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '@server/util';
import { User } from '@server/schemas';
import { UserPayload } from '@server/util';

export const authAPIRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY || '1';

export const authMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const token = req.cookies.token ?? '';

  jwt.verify(
    token,
    JWT_SECRET,
    (_: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (decoded) {
        req.user = decoded as UserPayload;
      }
    }
  );

  console.log('token', token);
  console.log('decoded user name', req.user?.username);
  next();
};

// POST /login  → process credentials, issue JWT
const loginHandler: any = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Build a minimal JWT payload
    const payload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    };
    const SECRET: Secret = process.env.JWT_SECRET_KEY!; // make sure .env has this

    // 3) optional sign options
    const options: SignOptions = {
      algorithm: 'HS256', // defaults to HS256 if you leave this off
      expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
    };

    // Sign the token
    const token: any = jwt.sign(payload, SECRET, options);
    // Optionally set it as a secure, httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1h
    });

    // Send back JSON
    // res.status(200).json({
    //   message: 'Login successful',
    //   token,
    // });
    res.status(200).redirect('/');
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
authAPIRouter.post('/login', loginHandler);

// POST /register  → create a new user
const registerHandler: RequestHandler = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const password_hash = await hashPassword(password);
    const newUser = new User({
      username,
      email,
      password_hash,
      role: 'user',
    });
    await newUser.save();
    console.log('New account created:', newUser._id);

    // Redirect to login page (or auto‐login by issuing JWT here)
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).redirect('/auth/register?error=true');
  }
};
authAPIRouter.post('/register', registerHandler);
