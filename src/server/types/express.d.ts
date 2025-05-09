import { UserPayload } from "@util/server";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}