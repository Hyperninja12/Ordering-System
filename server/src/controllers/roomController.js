import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { code, type, capacity, pricePerNight, status, amenities, notes } = req.body;

    if (!code || !type || !capacity || pricePerNight === undefined) {
      return res.status(400).json({ message: "Code, type, capacity, and price are required." });
    }

    const room = await Room.create({
      code,
      type,
      capacity,
      pricePerNight,
      status,
      amenities: Array.isArray(amenities) ? amenities : [],
      notes: notes || "",
      createdBy: req.user._id,
    });

    return res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Room code already exists." });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.amenities && !Array.isArray(payload.amenities)) {
      payload.amenities = [];
    }

    const room = await Room.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    return res.status(200).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Room code already exists." });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const activeBooking = await Booking.findOne({
      room: id,
      status: { $in: ["pending", "confirmed", "checked_in"] },
    });

    if (activeBooking) {
      return res.status(400).json({ message: "Room has active bookings and cannot be deleted." });
    }

    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    return res.status(200).json({ message: "Room deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
