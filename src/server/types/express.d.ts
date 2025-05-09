import { UserPayload } from '@util/server';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
    interface User {
      _id: string;
      email: string;
      username: string;
      role: string;
    }
  }
}
