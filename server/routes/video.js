import express from "express";
import {
  getallvideo,
  uploadvideo,
  streamVideo,
} from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const router = express.Router();

/* UPLOAD */
router.post("/upload", upload.single("file"), uploadvideo);

/* GET ALL VIDEOS */
router.get("/getall", getallvideo);

/* STREAM VIDEO */
router.get("/stream/:filename", streamVideo);

export default router;
