import express from "express";
import {
  deletecomment,
  getallcomment,
  postcomment,
  likeComment,
  dislikeComment,
  editComment, // ADD THIS
} from "../controllers/comment.js";

const router = express.Router();

// Post comment
router.post("/postcomment", postcomment);

// Like comment
router.post("/like/:id", likeComment);

// Dislike comment (auto delete at 2 dislikes)
router.post("/dislike/:id", dislikeComment);

// Edit comment ✅
router.post("/editcomment/:id", editComment);

// Delete comment
router.delete("/deletecomment/:id", deletecomment);

// GET all comments for video (keep last)
router.get("/:videoid", getallcomment);

export default router;
