import express from "express";

import { create, get } from "../controllers/commentController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, create);
router.get("/:bugId", protect, get);

export default router;
