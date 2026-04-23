import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createGuest, deleteGuest, getGuests, updateGuest } from "../controllers/guestController.js";

const router = express.Router();

router.use(protect);
router.get("/", getGuests);
router.post("/", createGuest);
router.put("/:id", updateGuest);
router.delete("/:id", deleteGuest);

export default router;
