import video from "../Modals/video.js";
import history from "../Modals/history.js";

/* ================= LOGGED-IN USER VIEW ================= */
export const handlehistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;

  if (!userId || !videoId) {
    return res.status(400).json({ message: "userId and videoId are required" });
  }

  try {
    // Save history
    await history.create({
      viewer: userId,
      videoid: videoId,
    });

    // Increment views
    await video.findByIdAndUpdate(videoId, {
      $inc: { views: 1 },
    });

    return res.status(200).json({ history: true });
  } catch (error) {
    console.error("handlehistory error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================= GUEST VIEW ================= */
export const handleview = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json({ message: "videoId is required" });
  }

  try {
    await video.findByIdAndUpdate(videoId, {
      $inc: { views: 1 },
    });

    // ✅ RESPONSE WAS MISSING (VERY IMPORTANT)
    return res.status(200).json({ viewed: true });
  } catch (error) {
    console.error("handleview error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================= GET USER HISTORY ================= */
export const getallhistoryVideo = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const historyvideo = await history
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      });

    return res.status(200).json(historyvideo);
  } catch (error) {
    console.error("getallhistoryVideo error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
