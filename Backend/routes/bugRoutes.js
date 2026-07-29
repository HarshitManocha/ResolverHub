import express from "express";

import {
	deleteBugController,
	getAllBugController,
	getBugController,
	registerBugController,
	updateBugController,
} from "../controllers/bugController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, registerBugController);
router.get("/", protect, getAllBugController);
router.get("/:id", protect, getBugController);
router.patch("/:id", protect, updateBugController);
router.delete("/:id", protect, deleteBugController);

export default router;
