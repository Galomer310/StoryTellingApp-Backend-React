import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken } from '../helpers/authHelpers';
import pool from '../db/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterRequestBody, LoginRequestBody } from '../../types/types';  // Import the types

// Register controller to add new users
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<Response | void> => {  // Specify RegisterRequestBody for req.body
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // Check if the user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    const newUser = result.rows[0];

    // Generate tokens for the new user
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // Set refresh token in the cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return res.status(201).json({ message: 'User registered successfully', accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Login controller to authenticate users
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<Response | void> => {  // Specify LoginRequestBody for req.body
  console.log(req.body); // Log the body to check the data
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('Query result:', result.rows);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token in the cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return res.json({ message: 'Login successful', accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Refresh access token
export const refreshAccessToken = (req: Request, res: Response): void => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user.userId);
    res.json({ accessToken: newAccessToken });
  });
};
