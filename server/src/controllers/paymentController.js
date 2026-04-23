import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { recomputeBookingPayment } from "./bookingController.js";

const bookingPopulate = {
  path: "booking",
  select: "code totalAmount paymentStatus paidAmount dueAmount",
  populate: [
    { path: "guest", select: "name" },
    { path: "room", select: "code type" },
  ],
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate(bookingPopulate).sort({ paidAt: -1 });
    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { booking, amount, method, status, paidAt, reference, notes } = req.body;

    if (!booking || !amount) {
      return res.status(400).json({ message: "Booking and amount are required." });
    }

    const bookingDoc = await Booking.findById(booking);
    if (!bookingDoc) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const payment = await Payment.create({
      booking,
      amount,
      method: method || "cash",
      status: status || "paid",
      paidAt: paidAt || new Date(),
      reference: reference || "",
      notes: notes || "",
      createdBy: req.user._id,
    });

    await recomputeBookingPayment(booking);
    const populatedPayment = await Payment.findById(payment._id).populate(bookingPopulate);

    return res.status(201).json(populatedPayment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate(bookingPopulate);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    await recomputeBookingPayment(payment.booking._id);
    const freshPayment = await Payment.findById(id).populate(bookingPopulate);
    return res.status(200).json(freshPayment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    await recomputeBookingPayment(payment.booking);
    return res.status(200).json({ message: "Payment deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
