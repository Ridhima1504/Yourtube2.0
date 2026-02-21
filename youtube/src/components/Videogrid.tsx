"use client";

import { useEffect, useState } from "react";
import VideoCard from "./videocard";
import axiosinstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosinstance.get("/video/getall");

        // ensure response is an array
        setVideos(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading ? (
        <p className="col-span-full text-center">Loading...</p>
      ) : videos.length > 0 ? (
        videos.map((video) => <VideoCard key={video._id} video={video} />)
      ) : (
        <p className="col-span-full text-center">No videos found</p>
      )}
    </div>
  );
};

export default Videogrid;
