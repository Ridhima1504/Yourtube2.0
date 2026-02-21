import express from "express";
import {
  checkDownloadLimit,
  registerDownload,
} from "../controllers/download.js";

const router = express.Router();

router.get("/check/:videoId/:userId", checkDownloadLimit);
router.post("/register", registerDownload);

export default router;
