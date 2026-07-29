import express from "express";

import {
	createProjectController,
	deleteProjectController,
	getAllProjectsController,
	getProjectController,
	getProjectMembersController,
	getProjectUnassignedMembersController,
	setProjectMemberRoleController,
	updateProjectController,
} from "../controllers/projectController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createProjectController);
router.get("/all", protect, getAllProjectsController);

// Static segments must be declared before "/:id" so they are not shadowed.
router.get("/members", protect, getProjectMembersController);
router.get("/free-members", protect, getProjectUnassignedMembersController);
router.patch("/members/:memberId/role", protect, setProjectMemberRoleController);

router.get("/:id", protect, getProjectController);
router.put("/:id", protect, updateProjectController);
router.delete("/:id", protect, deleteProjectController);

export default router;
