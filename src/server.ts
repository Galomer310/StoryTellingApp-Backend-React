import express from 'express';
import cookieParser from 'cookie-parser';
import storyRoutes from './routes/storyRoutes'
import path from 'path';
import authRoutes from './routes/authRoutes';
import cors from 'cors';

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));  // Allow frontend on port 5173
// Middleware to parse incoming JSON data
app.use(express.json());
app.use(cookieParser()); // For handling cookies
// Example root route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the Story API!');
});
app.use(cors());
app.use('/api/stories', storyRoutes); 
app.use('/api/auth', authRoutes); 


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.use(express.static(path.join(__dirname, "/frontend/Story-Telling/dist"))); 

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/Story-Telling/dist/index.html"));
});