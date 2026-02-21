import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import { sendInvoiceEmail } from "../utils/sendInvoiceEmail.js";

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { email, name, image } = req.body;

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      const newUser = await users.create({
        email,
        name,
        image,
        plan: "free",
      });

      return res.status(201).json({ result: newUser });
    }

    return res.status(200).json({ result: existingUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================= UPDATE PROFILE ================= */
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const updatedUser = await users.findByIdAndUpdate(
      _id,
      { channelname, description },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================= UPGRADE PLAN ================= */
export const upgradePlan = async (req, res) => {
  const { userId, plan, amount } = req.body;

  const prices = {
    bronze: 10,
    silver: 50,
    gold: 100,
  };

  if (!prices[plan] || prices[plan] !== amount) {
    return res.status(400).json({ message: "Invalid plan or amount" });
  }

  try {
    const user = await users.findByIdAndUpdate(
      userId,
      {
        plan,
        planActivatedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // // ✅ Send invoice email
    // await sendInvoiceEmail({
    //   email: user.email,
    //   name: user.name || "User",
    //   plan,
    //   amount,
    // });

    res.status(200).json({
      success: true,
      message: `Plan upgraded to ${plan}`,
      user,
    });
  } catch (error) {
    console.error("Upgrade plan error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
