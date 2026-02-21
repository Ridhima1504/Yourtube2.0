"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function Videocard({ video }: any) {
  return (
    <div className="group space-y-3">

      {/* Video Preview */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
        <video
          controls
          preload="metadata"
          className="w-full h-full object-cover"
        >
          <source
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/video/stream/${video?.filename}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <Link href={`/watch/${video?._id}`} className="block">
        <div className="flex gap-3">

          <Avatar className="w-9 h-9">
            <AvatarFallback>
              {video?.videochanel?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="font-medium text-sm line-clamp-2">
              {video?.videotitle}
            </h3>

            <p className="text-sm text-gray-600">
              {video?.views?.toLocaleString() || 0} views •{" "}
              {formatDistanceToNow(new Date(video?.createdAt))} ago
            </p>
          </div>

        </div>
      </Link>

    </div>
  );
}
