import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getSettings, updateSettings } from "../controllers/settingController.js";

const router = express.Router();

router.use(protect);
router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
