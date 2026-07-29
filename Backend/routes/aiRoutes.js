import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { aiSummaryController } from "../controllers/aiController.js";



const router = express.Router();

router.get("/:id", protect, aiSummaryController);


export default router;
