import Download from "../Modals/download.js";
import User from "../Modals/Auth.js";

/* ================= CHECK DOWNLOAD LIMIT ================= */
export const checkDownloadLimit = async (req, res) => {
  try {
    const { videoId, userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ allowed: false, message: "User not found" });
    }

    // GOLD → unlimited downloads
    if (user.plan === "gold") {
      return res.status(200).json({
        allowed: true,
        unlimited: true,
      });
    }

    // FREE / BRONZE / SILVER → once per day
    const today = new Date().toISOString().split("T")[0];

    const alreadyDownloaded = await Download.findOne({
      userId,
      videoId,
      date: today,
    });

    if (alreadyDownloaded) {
      return res.status(200).json({
        allowed: false,
        message: "You can download this video only once per day",
      });
    }

    return res.status(200).json({ allowed: true });
  } catch (error) {
    console.error("Check download error:", error);
    res.status(500).json({ allowed: false, message: "Server error" });
  }
};

/* ================= REGISTER DOWNLOAD ================= */
export const registerDownload = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    const today = new Date().toISOString().split("T")[0];

    await Download.create({
      userId,
      videoId,
      date: today,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Register download error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
