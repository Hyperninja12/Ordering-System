import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "e_wallet"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "paid",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1, paidAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
