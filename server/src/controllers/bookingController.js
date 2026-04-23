import Booking from "../models/Booking.js";
import Guest from "../models/Guest.js";
import Payment from "../models/Payment.js";
import Room from "../models/Room.js";
import Setting from "../models/Setting.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "checked_in"];

const generateBookingCode = () => `BK-${Date.now().toString().slice(-6)}`;

const getNights = (checkInDate, checkOutDate) => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / millisecondsPerDay);
  return Math.max(diff, 1);
};

const ensureNoRoomConflict = async ({ roomId, checkInDate, checkOutDate, bookingId }) => {
  const filter = {
    room: roomId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkInDate: { $lt: new Date(checkOutDate) },
    checkOutDate: { $gt: new Date(checkInDate) },
  };

  if (bookingId) {
    filter._id = { $ne: bookingId };
  }

  const overlappingBooking = await Booking.findOne(filter);
  if (overlappingBooking) {
    throw new Error("Selected room is not available for the requested dates.");
  }
};

const computeTotalAmount = async ({ room, checkInDate, checkOutDate }) => {
  const settings = await Setting.findOne({ key: "global" });
  const nights = getNights(checkInDate, checkOutDate);
  const baseAmount = room.pricePerNight * nights;
  const taxRate = settings?.taxRate || 0;
  const totalAmount = Number((baseAmount + baseAmount * (taxRate / 100)).toFixed(2));
  return totalAmount;
};

export const recomputeBookingPayment = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return null;
  }

  const paymentTotals = await Payment.aggregate([
    { $match: { booking: booking._id, status: "paid" } },
    { $group: { _id: "$booking", totalPaid: { $sum: "$amount" } } },
  ]);

  const paidAmount = paymentTotals[0]?.totalPaid || 0;
  const dueAmount = Number(Math.max(booking.totalAmount - paidAmount, 0).toFixed(2));

  let paymentStatus = "unpaid";
  if (paidAmount > 0 && dueAmount > 0) {
    paymentStatus = "partial";
  } else if (dueAmount === 0) {
    paymentStatus = "paid";
  }

  booking.paidAmount = Number(paidAmount.toFixed(2));
  booking.dueAmount = dueAmount;
  booking.paymentStatus = paymentStatus;
  await booking.save();

  return booking;
};

export const getBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.checkInDate = { $lte: new Date(endDate) };
      filter.checkOutDate = { $gte: new Date(startDate) };
    }

    const bookings = await Booking.find(filter)
      .populate("guest", "name email phone")
      .populate("room", "code type status pricePerNight")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { guest, room, checkInDate, checkOutDate, guestsCount, status, notes } = req.body;

    if (!guest || !room || !checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({ message: "Guest, room, check-in date, and check-out date are required." });
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    const [guestDoc, roomDoc] = await Promise.all([Guest.findById(guest), Room.findById(room)]);

    if (!guestDoc) {
      return res.status(404).json({ message: "Guest not found." });
    }
    if (!roomDoc) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (guestsCount > roomDoc.capacity) {
      return res.status(400).json({ message: "Guests count exceeds room capacity." });
    }

    await ensureNoRoomConflict({ roomId: room, checkInDate, checkOutDate });
    const totalAmount = await computeTotalAmount({ room: roomDoc, checkInDate, checkOutDate });

    const booking = await Booking.create({
      code: generateBookingCode(),
      guest,
      room,
      checkInDate,
      checkOutDate,
      guestsCount: guestsCount || 1,
      status: status || "pending",
      totalAmount,
      dueAmount: totalAmount,
      notes: notes || "",
      createdBy: req.user._id,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("guest", "name email phone")
      .populate("room", "code type status pricePerNight");

    return res.status(201).json(populatedBooking);
  } catch (error) {
    if (error.message?.includes("not available")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "Booking code collision. Try again." });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const nextGuestId = payload.guest || booking.guest;
    const nextRoomId = payload.room || booking.room;
    const nextCheckInDate = payload.checkInDate || booking.checkInDate;
    const nextCheckOutDate = payload.checkOutDate || booking.checkOutDate;
    const nextGuestsCount = payload.guestsCount || booking.guestsCount;

    if (new Date(nextCheckOutDate) <= new Date(nextCheckInDate)) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    const [guestDoc, roomDoc] = await Promise.all([
      Guest.findById(nextGuestId),
      Room.findById(nextRoomId),
    ]);

    if (!guestDoc) {
      return res.status(404).json({ message: "Guest not found." });
    }
    if (!roomDoc) {
      return res.status(404).json({ message: "Room not found." });
    }
    if (nextGuestsCount > roomDoc.capacity) {
      return res.status(400).json({ message: "Guests count exceeds room capacity." });
    }

    await ensureNoRoomConflict({
      roomId: nextRoomId,
      checkInDate: nextCheckInDate,
      checkOutDate: nextCheckOutDate,
      bookingId: booking._id,
    });

    const totalAmount = await computeTotalAmount({
      room: roomDoc,
      checkInDate: nextCheckInDate,
      checkOutDate: nextCheckOutDate,
    });

    booking.guest = nextGuestId;
    booking.room = nextRoomId;
    booking.checkInDate = nextCheckInDate;
    booking.checkOutDate = nextCheckOutDate;
    booking.guestsCount = nextGuestsCount;
    booking.status = payload.status || booking.status;
    booking.notes = payload.notes ?? booking.notes;
    booking.totalAmount = totalAmount;
    await booking.save();
    await recomputeBookingPayment(booking._id);

    const populatedBooking = await Booking.findById(booking._id)
      .populate("guest", "name email phone")
      .populate("room", "code type status pricePerNight");

    return res.status(200).json(populatedBooking);
  } catch (error) {
    if (error.message?.includes("not available")) {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
      .populate("guest", "name email phone")
      .populate("room", "code type status pricePerNight");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    await Payment.deleteMany({ booking: id });
    return res.status(200).json({ message: "Booking deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
