import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

// Controller to create a new story
export const createStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { title, content } = req.body;
  const authorId = req.user?.id; // Get the ID from the authenticated user
  console.log(req.user);

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  if (!authorId) {
    res.status(403).json({ error: 'User not authenticated' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO stories (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, authorId] // Insert the author's ID
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create story error', error);
    next(error); // Call next to pass errors to the global error handler
  }
};

// Controller to get all stories
export const getStories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM stories');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get stories error:', error);
    next(error); // Call next to pass errors to the global error handler
  }
};

// Controller to get a single story by ID
export const getStoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { storyId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM stories WHERE id = $1', [storyId]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get story by ID error:', error);
    next(error); // Call next to pass errors to the global error handler
  }
};

// Example function to add a collaborator
export const addCollaborator = async (req: Request, res: Response): Promise<void> => {
  const { userId, storyId } = req.body; // Assuming body contains userId and storyId
  try {
    // Check if the user is the author first
    const storyResult = await pool.query('SELECT * FROM stories WHERE id = $1', [storyId]);
    const story = storyResult.rows[0];

    if (!story || !req.user || story.author_id !== req.user.id) {
      res.status(403).json({ error: 'Only the author can add collaborators' });
      return;
    }

    // Insert the collaborator
    const collaboratorResult = await pool.query(
      'INSERT INTO contributors (user_id, story_id) VALUES ($1, $2) RETURNING *',
      [userId, storyId]
    );
    res.status(200).json({ message: 'Collaborator added successfully', collaborator: collaboratorResult.rows[0] });
  } catch (error) {
    console.error('Add collaborator error', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
};
