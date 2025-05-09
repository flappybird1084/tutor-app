import path from 'path';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

export function file(...fragments: string[]) {
  return path.join(process.cwd(), ...fragments);
}

// promisify returns a function whose result is `unknown`
const scrypt = promisify(_scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  // cast the unknown return value to Buffer
  const derivedBuf = (await scrypt(password, salt, 64)) as Buffer;
  return salt + ':' + derivedBuf.toString('hex');
}

export async function verifyPassword(password: string, stored: any) {
  const [salt, key] = stored.split(':');
  const derivedBuf = (await scrypt(password, salt, 64)) as Buffer;
  return derivedBuf.toString('hex') === key;
}

export interface UserPayload {
  sub: string;
  username: string;
  role: string;
}
