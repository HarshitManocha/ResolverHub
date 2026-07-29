import express from "express";

import {
	acceptRequest,
	denyRequest,
	getCompanyRequests,
	getNotifications,
	getProjectRequests,
	joinCompany,
	joinProject,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../controllers/notificationController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/company-requests", protect, getCompanyRequests);
router.get("/project-requests", protect, getProjectRequests);

router.post("/company/join", protect, joinCompany);
router.post("/project/join", protect, joinProject);

router.patch("/read-all", protect, markAllNotificationsAsRead);
router.patch("/:id/read", protect, markNotificationAsRead);
router.patch("/:id/accept", protect, acceptRequest);
router.patch("/:id/deny", protect, denyRequest);

export default router;
