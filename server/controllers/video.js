import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Video from "../Modals/video.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= UPLOAD VIDEO ================= */
export const uploadvideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const newVideo = new Video({
      videotitle: req.body.videotitle || "Untitled Video",
      filename: req.file.filename,
      filepath: `/uploads/${req.file.filename}`,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel || "Unknown",
      uploader: req.body.uploader || "Anonymous",
    });

    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* ================= GET ALL VIDEOS ================= */
export const getallvideo = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

/* ================= STREAM VIDEO ================= */
export const streamVideo = (req, res) => {
  try {
    const videoPath = path.join(
      __dirname,
      "../uploads",
      req.params.filename
    );

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Streaming error:", error);
    res.status(404).send("Video not found");
  }
};
