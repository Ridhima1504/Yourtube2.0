"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

/* ================= TYPES ================= */
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  city?: string;
  createdAt?: string;
  likes: string[];
  dislikes: string[];
}

/* ================= LANGUAGES ================= */
const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
];

/* ================= COMPONENT ================= */
const Comments = ({ videoId }: { videoId: string }) => {
  const { user } = useUser();

  const [comments, setComments] = useState<Comment[]>([]);
  const [translated, setTranslated] = useState<Record<string, string>>({});
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});

  /* ================= LOAD COMMENTS ================= */
  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(
        Array.isArray(res.data)
          ? res.data.map((c) => ({
              ...c,
              likes: Array.isArray(c.likes) ? c.likes : [],
              dislikes: Array.isArray(c.dislikes) ? c.dislikes : [],
            }))
          : []
      );
    } catch (err) {
      console.error(err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) loadComments();
  }, [videoId]);

  /* ================= VALIDATION ================= */
  const isValidComment = (text: string) =>
    /^[\p{L}\p{N}\s.,?!]+$/u.test(text);

  /* ================= ADD COMMENT ================= */
  const handleAdd = async () => {
    if (!user || !newComment.trim()) return;
    if (!isValidComment(newComment)) {
      alert("Special characters are not allowed");
      return;
    }
    try {
      await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        usercommented: user.name,
        city: user.city || "Unknown",
        commentbody: newComment,
      });
      setNewComment("");
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LIKE / DISLIKE ================= */
  const handleLike = async (id: string) => {
    if (!user) return;
    try {
      await axiosInstance.post(`/comment/like/${id}`, { userid: user._id });
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (id: string) => {
    if (!user) return;
    try {
      await axiosInstance.post(`/comment/dislike/${id}`, { userid: user._id });
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const deleteComment = async (id: string) => {
    try {
      await axiosInstance.delete(`/comment/deletecomment/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FRONTEND TRANSLATION ================= */
  const handleTranslate = async (id: string, lang: string) => {
    try {
      const text = comments.find((c) => c._id === id)?.commentbody;
      if (!text) return;

      setTranslateLoading((prev) => ({ ...prev, [id]: true }));

      const url =
        "https://translate.googleapis.com/translate_a/single" +
        "?client=gtx" +
        "&sl=auto" +
        `&tl=${lang}` +
        "&dt=t" +
        `&q=${encodeURIComponent(text)}`;

      const res = await fetch(url);
      const data = await res.json();

      const translatedText = data[0]
        .map((item: any) => item[0])
        .join("");

      setTranslated((prev) => ({ ...prev, [id]: translatedText }));
    } catch (err) {
      console.error("Translation failed", err);
      alert("Translation failed");
    } finally {
      setTranslateLoading((prev) => ({ ...prev, [id]: false }));
      setDropdownOpen((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) return <p>Loading comments...</p>;

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <h2 className="font-semibold">{comments.length} Comments</h2>

      <Textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        disabled={!user}
      />
      <Button onClick={handleAdd} disabled={!user}>
        Comment
      </Button>

      {comments.map((c) => (
        <div key={c._id} className="flex gap-4 border-b pb-4">
          <Avatar>
            <AvatarFallback>
              {c.usercommented?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="font-medium">
              {c.usercommented} ({c.city || "Unknown"})
            </p>
            <p className="text-xs text-gray-500">
              {c.createdAt
                ? formatDistanceToNow(new Date(c.createdAt)) + " ago"
                : "Just now"}
            </p>

            <p>{translated[c._id] || c.commentbody}</p>

            <div className="flex gap-4 text-sm mt-2 items-center">
              <button onClick={() => handleLike(c._id)}>
                👍 {c.likes.length}
              </button>
              <button onClick={() => handleDislike(c._id)}>
                👎 {c.dislikes.length}
              </button>

              {/* TRANSLATE */}
              <div className="relative">
                <Button
                  size="sm"
                  onClick={() =>
                    setDropdownOpen((prev) => ({
                      ...prev,
                      [c._id]: !prev[c._id],
                    }))
                  }
                >
                  Translate ▼
                </Button>

                {dropdownOpen[c._id] && (
                  <div className="absolute bg-white border rounded shadow-md z-10">
                    {languageOptions.map((lang) => (
                      <div
                        key={lang.code}
                        className="px-3 py-1 cursor-pointer hover:bg-gray-200"
                        onClick={() =>
                          handleTranslate(c._id, lang.code)
                        }
                      >
                        {translateLoading[c._id]
                          ? "Translating..."
                          : lang.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* EDIT / DELETE */}
              {c.userid === user?._id && (
                <div className="flex gap-2">
                  {editingId === c._id ? (
                    <>
                      <Textarea
                        value={editText}
                        onChange={(e) =>
                          setEditText(e.target.value)
                        }
                      />
                      <Button
                        onClick={async () => {
                          if (!editText.trim()) return;
                          if (!isValidComment(editText)) {
                            alert("Invalid characters");
                            return;
                          }
                          await axiosInstance.post(
                            `/comment/editcomment/${c._id}`,
                            { commentbody: editText }
                          );
                          setEditingId(null);
                          setEditText("");
                          loadComments();
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(c._id);
                          setEditText(c.commentbody);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(c._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;
