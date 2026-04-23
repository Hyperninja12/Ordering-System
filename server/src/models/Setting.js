import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
    },
    checkInTime: {
      type: String,
      default: "14:00",
    },
    checkOutTime: {
      type: String,
      default: "12:00",
    },
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 12,
    },
    currency: {
      type: String,
      default: "USD",
      trim: true,
      uppercase: true,
    },
    cancellationHours: {
      type: Number,
      min: 0,
      default: 24,
    },
    notificationEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
