import comment from "../Modals/comment.js";
import mongoose from "mongoose";

/* ================= POST COMMENT ================= */
export const postcomment = async (req, res) => {
  try {
    const newComment = new comment(req.body);
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Post comment error:", error);
    res.status(500).json({ message: "Failed to post comment" });
  }
};

/* ================= GET ALL COMMENTS ================= */
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;

  try {
    const comments = await comment
      .find({ videoid })
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

/* ================= DELETE COMMENT ================= */
export const deletecomment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Comment not found" });
  }

  try {
    await comment.findByIdAndDelete(id);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================= LIKE COMMENT ================= */
export const likeComment = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body;

  try {
    const existing = await comment.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // prevent duplicate like
    if (existing.likes.some((u) => u.toString() === userid)) {
      return res.status(200).json(existing);
    }

    // remove dislike if exists
    existing.dislikes = existing.dislikes.filter(
      (u) => u.toString() !== userid
    );

    existing.likes.push(userid);

    await existing.save();
    res.status(200).json(existing);
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================= DISLIKE COMMENT (AUTO DELETE AT 2) ================= */
export const dislikeComment = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const existing = await comment.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // prevent duplicate dislike
    if (existing.dislikes.some((u) => u.toString() === userid)) {
      return res.status(200).json(existing);
    }

    // remove like if exists
    existing.likes = existing.likes.filter(
      (u) => u.toString() !== userid
    );

    existing.dislikes.push(userid);

    // 🔥 AUTO DELETE AT 2 DISLIKES
    if (existing.dislikes.length >= 2) {
      await comment.findByIdAndDelete(id);
      return res.status(200).json({ deleted: true });
    }

    await existing.save();
    res.status(200).json(existing);
  } catch (error) {
    console.error("Dislike comment error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
/* ================= EDIT COMMENT ================= */
export const editComment = async (req, res) => {
  const { id } = req.params;
  const { commentbody } = req.body;

  if (!commentbody || commentbody.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Comment not found" });
  }

  try {
    const updatedComment = await comment.findByIdAndUpdate(
      id,
      { commentbody },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Edit comment error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
