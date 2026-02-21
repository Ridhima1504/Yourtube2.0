import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    videotitle: { type: String, required: true },
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    filetype: { type: String, required: true },
    filesize: { type: Number, required: true },
    videochanel: { type: String, required: true },
    uploader: { type: String },
    views: { type: Number, default: 0 },
    Like: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("videofiles", videoSchema);
