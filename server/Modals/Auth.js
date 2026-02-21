import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,

    plan: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      default: "free",
    },

    planActivatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
