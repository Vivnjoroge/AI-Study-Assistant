import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import { createError } from '../middleware/errorHandler';
import { JwtPayload, User } from '../types';

const SALT_ROUNDS = 12;
const JWT_EXPIRY = '7d';

/** Register a new user; throws 409 if email already exists */
export async function register(email: string, password: string, fullName?: string): Promise<string> {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw createError('Email already registered', 409);
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name`,
    [email, password_hash, fullName]
  );

  const user: Pick<User, 'id' | 'email' | 'full_name'> = result.rows[0];
  return signToken({ userId: user.id, email: user.email });
}

/** Login an existing user; throws 401 on invalid credentials */
export async function login(email: string, password: string): Promise<{ token: string; user: Pick<User, 'id' | 'email' | 'full_name'> }> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw createError('Invalid email or password', 401);
  }

  const user: User = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw createError('Invalid email or password', 401);
  }

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, full_name: user.full_name } };
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRY });
}
