import Booking from "../models/Booking.js";
import Guest from "../models/Guest.js";

export const getGuests = async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    return res.status(200).json(guests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createGuest = async (req, res) => {
  try {
    const { name, email, phone, idNumber, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Guest name is required." });
    }

    const guest = await Guest.create({
      name,
      email: email || "",
      phone: phone || "",
      idNumber: idNumber || "",
      address: address || "",
      notes: notes || "",
      createdBy: req.user._id,
    });

    return res.status(201).json(guest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;

    const guest = await Guest.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!guest) {
      return res.status(404).json({ message: "Guest not found." });
    }

    return res.status(200).json(guest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const linkedBooking = await Booking.findOne({ guest: id });

    if (linkedBooking) {
      return res.status(400).json({ message: "Guest has bookings and cannot be deleted." });
    }

    const guest = await Guest.findByIdAndDelete(id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found." });
    }

    return res.status(200).json({ message: "Guest deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
