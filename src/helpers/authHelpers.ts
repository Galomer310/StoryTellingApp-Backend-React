import jwt from 'jsonwebtoken';

// Generate Access Token
export const generateAccessToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
};

// Generate Refresh Token
export const generateRefreshToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.REFRESH_SECRET as string, { expiresIn: '7d' });
};
