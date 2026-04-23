import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const router = express.Router();

router.use(protect);
router.get("/", getBookings);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.patch("/:id/status", updateBookingStatus);
router.delete("/:id", deleteBooking);

export default router;
