import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createRoom, deleteRoom, getRooms, updateRoom } from "../controllers/roomController.js";

const router = express.Router();

router.use(protect);
router.get("/", getRooms);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

export default router;
