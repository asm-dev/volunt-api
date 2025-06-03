import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

volunteerSchema.index({ taskId: 1, userId: 1 }, { unique: true });

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;
