import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '../constants/roles';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
