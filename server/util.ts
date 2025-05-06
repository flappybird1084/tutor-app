import path from 'path';

export function file(...fragments: string[]) {
  return path.join(process.cwd(), ...fragments);
}
