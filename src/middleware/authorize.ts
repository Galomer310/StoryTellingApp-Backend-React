import { Request, Response, NextFunction } from "express";
import pool from "../db/connection"; 

export const authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user; // Access user from the request object
  const { storyId } = req.params; // Get the storyId from the route params
  const action = req.method.toLowerCase(); // Determine the action (edit, delete, etc.)

  if (!user) {
    res.status(403).json({ error: "User not authenticated" });
    return;
  }

  try {
    // Fetch story details
    const result = await pool.query("SELECT * FROM stories WHERE id = $1", [storyId]);
    const story = result.rows[0];

    if (!story) {
      res.status(404).json({ error: "Story not found" });
      return;
    }

    // Check if the user is the author or a collaborator
    const isAuthor = user.id === story.author_id;
    let isCollaborator = false;
    
    console.log(isAuthor)
    console.log(isCollaborator)

    if (!isAuthor) {
      // If not the author, check if the user is a collaborator (if applicable)
      const collaboratorResult = await pool.query(
        "SELECT * FROM contributors WHERE user_id = $1 AND story_id = $2",
        [user.id, storyId]
      );
      isCollaborator = collaboratorResult.rows.length > 0;
    }

    // Authorization logic based on action (edit or delete)
    if (action === "delete") {
      if (!isAuthor) {
        res.status(403).json({ error: "Only the author can delete this story" });
        return;
      }
    }

    if (action === "put" || action === "patch") { // For editing
      if (!(isAuthor || isCollaborator)) {
        res.status(403).json({ error: "You are not authorized to edit this story" });
        return;
      }
    }

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ error: "Failed to check authorization" });
  }
};
