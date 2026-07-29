import express from "express";

import {
	create,
	getMine,
	getProjectAdmins,
	remove,
	update,
} from "../controllers/companyController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, create);
router.get("/me", protect, getMine);
router.get("/free-members", protect, getProjectAdmins);
router.put("/:companyId", protect, update);
router.delete("/:companyId", protect, remove);

export default router;
