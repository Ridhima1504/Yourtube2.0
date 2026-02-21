import express from "express";
const router = express.Router();

// Send OTP via email
router.post("/email", (req, res) => {
  const { email } = req.body;
  console.log("Send OTP to email:", email);
  res.status(200).json({ success: true, message: "OTP sent via email" });
});

// Send OTP via mobile
router.post("/mobile", (req, res) => {
  const { phone } = req.body;
  console.log("Send OTP to phone:", phone);
  res.status(200).json({ success: true, message: "OTP sent via mobile" });
});

export default router;
