import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JwtPayload } from '../../types/types';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    res.status(403).json({ error: 'No token provided' }); // Return here and avoid further execution
    return
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'JWT secret is not defined' }); // Return here and avoid further execution
    return
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' }); // Return here and avoid further execution
    }

    // Type casting for decoded payload
    const user = decoded as JwtPayload;

    // Set the user data to request
    req.user = { id: user.userId, username: user.username }; // Ensure user.id is set correctly
    next(); // Proceed to the next middleware/route handler
  });
};
