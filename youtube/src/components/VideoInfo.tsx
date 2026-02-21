"use client";

import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface VideoInfoProps {
  video: any;
}

/* ================= PLAN WATCH LIMITS (seconds) ================= */
const PLAN_LIMITS: Record<string, number> = {
  free: 2 * 60,
  bronze: 2 * 60,
  silver: 5 * 60,
  gold: Infinity,
};

const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  const { user, login } = useUser();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const viewSentRef = useRef(false);
  const lastTapRef = useRef<number>(0);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const plan = user?.plan || "free";
  const watchLimit = PLAN_LIMITS[plan];

  /* ================= RESET ON VIDEO CHANGE ================= */
  useEffect(() => {
    if (!video) return;

    setLikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
    setIsWatchLater(false);
    setWatchTime(0);
    setLimitReached(false);
    viewSentRef.current = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [video]);

  /* ================= DOUBLE TAP SEEK ================= */
  const handleSeek = (clientX: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const rect = videoEl.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const width = rect.width;

    if (clickX > width / 2) {
      // Forward 10 sec
      videoEl.currentTime = Math.min(
        videoEl.currentTime + 10,
        videoEl.duration || videoEl.currentTime + 10
      );
    } else {
      // Backward 10 sec
      videoEl.currentTime = Math.max(videoEl.currentTime - 10, 0);
    }
  };

  const handleTap = (clientX: number) => {
    const now = Date.now();
    const diff = now - lastTapRef.current;

    if (diff < 300 && diff > 0) {
      handleSeek(clientX);
    }

    lastTapRef.current = now;
  };

  /* ================= WATCH TIMER ================= */
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || plan === "gold") return;

    const startTimer = () => {
      if (timerRef.current) return;

      timerRef.current = setInterval(() => {
        setWatchTime((prev) => {
          if (prev + 1 >= watchLimit) {
            videoEl.pause();
            setLimitReached(true);
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    videoEl.addEventListener("play", startTimer);
    videoEl.addEventListener("pause", stopTimer);
    videoEl.addEventListener("ended", stopTimer);

    return () => {
      videoEl.removeEventListener("play", startTimer);
      videoEl.removeEventListener("pause", stopTimer);
      videoEl.removeEventListener("ended", stopTimer);
      stopTimer();
    };
  }, [plan, watchLimit]);

  /* ================= VIEWS ================= */
  useEffect(() => {
    if (!video?._id || viewSentRef.current) return;

    const sendView = async () => {
      try {
        if (user?._id) {
          await axiosInstance.post(`/history/${video._id}`, {
            userId: user._id,
          });
        } else {
          await axiosInstance.post(`/history/views/${video._id}`);
        }
        viewSentRef.current = true;
      } catch (err) {
        console.error("View error:", err);
      }
    };

    sendView();
  }, [video?._id, user?._id]);

  /* ================= LIKE ================= */
  const handleLike = async () => {
    if (!user?._id) return;

    const res = await axiosInstance.post(`/like/${video._id}`, {
      userId: user._id,
    });

    if (res.data.liked) {
      setLikes((p) => (isLiked ? p - 1 : p + 1));
      setIsLiked(!isLiked);
      if (isDisliked) {
        setDislikes((p) => p - 1);
        setIsDisliked(false);
      }
    }
  };

  /* ================= DISLIKE ================= */
  const handleDislike = async () => {
    if (!user?._id) return;

    const res = await axiosInstance.post(`/like/${video._id}`, {
      userId: user._id,
    });

    if (!res.data.liked) {
      setDislikes((p) => (isDisliked ? p - 1 : p + 1));
      setIsDisliked(!isDisliked);
      if (isLiked) {
        setLikes((p) => p - 1);
        setIsLiked(false);
      }
    }
  };

  /* ================= WATCH LATER ================= */
  const handleWatchLater = async () => {
    if (!user?._id) return;

    const res = await axiosInstance.post(`/watch/${video._id}`, {
      userId: user._id,
    });

    setIsWatchLater(Boolean(res.data.watchlater));
  };

  /* ================= DOWNLOAD ================= */
  const handleDownload = async () => {
    if (!user?._id) return;

    const check = await axiosInstance.get(
      `/download/check/${video._id}/${user._id}`
    );

    if (!check.data.allowed) {
      alert(check.data.message);
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${video.filename}`;
    const blob = await fetch(url).then((r) => r.blob());

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = video.filename;
    a.click();
    URL.revokeObjectURL(a.href);

    if (plan !== "gold") {
      await axiosInstance.post("/download/register", {
        userId: user._id,
        videoId: video._id,
      });
    }
  };

  /* ================= UPGRADE PLAN ================= */
  const upgradePlan = async (newPlan: string, amount: number) => {
    if (!user?._id) return;

    const confirmPay = window.confirm(
      `Pay ₹${amount} to upgrade to ${newPlan.toUpperCase()} plan?`
    );
    if (!confirmPay) return;

    const res = await axiosInstance.post("/user/upgrade-plan", {
      userId: user._id,
      plan: newPlan,
      amount,
    });

    login(res.data.user);
    setLimitReached(false);
    videoRef.current?.play();
    alert("🎉 Plan upgraded successfully!");
  };

  if (!video) return null;
  const videoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${video.filepath}`;

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full max-h-[600px] rounded-lg"
          onClick={(e) => handleTap(e.clientX)}
          onTouchEnd={(e) =>
            handleTap(e.changedTouches[0].clientX)
          }
        />

        {limitReached && plan !== "gold" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10">
            <p className="mb-4 text-lg">⏱ Watch limit reached</p>
            <div className="flex gap-2">
              <Button onClick={() => upgradePlan("bronze", 10)}>Bronze ₹10</Button>
              <Button onClick={() => upgradePlan("silver", 50)}>Silver ₹50</Button>
              <Button onClick={() => upgradePlan("gold", 100)}>Gold ₹100</Button>
            </div>
          </div>
        )}
      </div>

      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {video.videochanel?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3>{video.videochanel}</h3>
            <p className="text-sm text-gray-600">
              Plan: <b>{plan.toUpperCase()}</b>
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleLike}>
            <ThumbsUp className="mr-1" /> {likes}
          </Button>
          <Button onClick={handleDislike}>
            <ThumbsDown className="mr-1" /> {dislikes}
          </Button>
          <Button onClick={handleWatchLater}>
            <Clock className="mr-1" /> Watch Later
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-1" /> Download
          </Button>
          <Button>
            <MoreHorizontal />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <span>{video.views} views · </span>
        <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        <p className="mt-2">{video.description}</p>
      </div>
    </div>
  );
};

export default VideoInfo;