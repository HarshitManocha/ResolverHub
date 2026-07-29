import {
	acceptJoinRequest,
	denyJoinRequest,
	fetchCompanyRequests,
	fetchProjectRequests,
	fetchUserNotifications,
	markAllAsRead,
	markAsRead,
	requestCompanyJoin,
	requestProjectJoin,
} from "../services/notificationService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const joinCompany = asyncHandler(async (req, res) => {
	const data = await requestCompanyJoin(req.body.inviteCode, req.id);
	res.status(201).json({
		success: true,
		message: "Company join request sent",
		data,
	});
});

export const joinProject = asyncHandler(async (req, res) => {
	const data = await requestProjectJoin(req.body.projectId, req.id);
	res.status(201).json({
		success: true,
		message: "Project join request sent",
		data,
	});
});

export const getNotifications = asyncHandler(async (req, res) => {
	const data = await fetchUserNotifications(req.id);
	res.status(200).json({
		success: true,
		message: "Notifications fetched successfully",
		data,
	});
});

export const getCompanyRequests = asyncHandler(async (req, res) => {
	const data = await fetchCompanyRequests(req.id);
	res.status(200).json({
		success: true,
		message: "Company join requests fetched successfully",
		data,
	});
});

export const getProjectRequests = asyncHandler(async (req, res) => {
	const data = await fetchProjectRequests(req.id);
	res.status(200).json({
		success: true,
		message: "Project join requests fetched successfully",
		data,
	});
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
	const data = await markAsRead(req.params.id, req.id);
	res.status(200).json({
		success: true,
		message: "Notification marked as read",
		data,
	});
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
	const data = await markAllAsRead(req.id);
	res.status(200).json({
		success: true,
		message: "All notifications marked as read",
		data,
	});
});

export const acceptRequest = asyncHandler(async (req, res) => {
	const data = await acceptJoinRequest(req.params.id, req.id, req.body?.role);
	res.status(200).json({
		success: true,
		message: "Request accepted successfully",
		data,
	});
});

export const denyRequest = asyncHandler(async (req, res) => {
	const data = await denyJoinRequest(req.params.id, req.id);
	res.status(200).json({
		success: true,
		message: "Request declined successfully",
		data,
	});
});
