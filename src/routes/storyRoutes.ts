import express, { Request, Response } from 'express';
import {
  createStory,
  getStories,
  addCollaborator,
  getStoryById,
} from '../controllers/storyController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorize } from '../middleware/authorize';
import pool from '../db/connection';

const router = express.Router();

// Route to create a new story
router.post('/', authenticateToken, createStory);

// Route to get all stories
router.get('/', getStories);

// Route to get a single story by ID
router.get('/:storyId', getStoryById);

// Route to add a collaborator to a story (only the author can do this)
router.post('/add-collaborator', authenticateToken, authorize, addCollaborator);

// Route to update a story
router.put('/:storyId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { storyId } = req.params;
  const { title, content } = req.body;
  const authorId = req.user?.id; // Ensure req.user is properly set

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return
  }

  if (!authorId) {
    res.status(403).json({ error: 'User not authenticated' });
    return
  }

  try {
    const result = await pool.query(
      'UPDATE stories SET title = $1, content = $2 WHERE id = $3 AND author_id = $4 RETURNING *',
      [title, content, storyId, authorId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Story not found or not authorized to edit' });
      return;
    }

    // Send the updated story as response
    res.status(200).json(result.rows[0]);
    return
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ error: 'Failed to update story' });
    return
  }
});
// Route to delete a story (only the author can delete)
router.delete('/:storyId', authenticateToken, authorize, async (req, res): Promise<void> => {
  const { storyId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM stories WHERE id = $1 AND author_id = $2 RETURNING *',
      [storyId, req.user?.id]  // Ensure the user can only delete their own story
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Story not found or not authorized to delete" });
      return;
    }

    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});


export default router;
