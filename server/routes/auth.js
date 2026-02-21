import express from "express";
import {
  login,
  updateprofile,
  upgradePlan,
} from "../controllers/auth.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", login);

/* ================= PROFILE ================= */
router.patch("/update/:id", updateprofile);

/* ================= PLAN UPGRADE ================= */
router.post("/upgrade-plan", upgradePlan);

export default router;
