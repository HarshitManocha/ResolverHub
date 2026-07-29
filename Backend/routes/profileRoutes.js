import express from "express";

import {
	changePassword,
	getMe,
	updateProfile,
} from "../controllers/profileController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
