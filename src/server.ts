import express from 'express';
import cookieParser from 'cookie-parser';
import storyRoutes from './routes/storyRoutes';
import path from 'path';
import authRoutes from './routes/authRoutes';
import cors from 'cors';

const app = express();

// List of allowed origins for CORS
const allowedOrigins = [
  'https://storytelling-frontend-react.onrender.com', // Your deployed frontend domain
  'http://localhost:5173', // Local development environment
];

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (allowedOrigins.includes(origin || '') || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow credentials if using cookies/sessions
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse incoming JSON data
app.use(express.json());
app.use(cookieParser()); // For handling cookies

// Example root route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the Story API!');
});

// Use your routes
app.use('/api/stories', storyRoutes); 
app.use('/api/auth', authRoutes); 

// Serve static files from the frontend dist folder
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Serve the index.html for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
