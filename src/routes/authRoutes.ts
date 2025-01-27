import express from 'express';
import { login, register, refreshAccessToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { RegisterRequestBody, LoginRequestBody } from '../../../frontend/types/types';  // Import types for request bodies

const router = express.Router();

// Register route
router.post('/register', (req: express.Request<{}, {}, RegisterRequestBody>, res: express.Response) => {  // Use RegisterRequestBody for req.body
  register(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error' });
  });
});

// Login route
router.post('/login', (req: express.Request<{}, {}, LoginRequestBody>, res: express.Response) => {  // Use LoginRequestBody for req.body
  login(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error' });
  });
});

// Refresh token route
router.post('/refresh', (req: express.Request, res: express.Response) => {
  refreshAccessToken(req, res);
});

// Example of a protected route
router.get('/protected', authenticateToken, (req: express.Request, res: express.Response) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

export default router;
