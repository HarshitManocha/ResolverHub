import Notification from "../models/notificationModel.js";

export const createNotification = async (notificationData) => {
	return await Notification.create(notificationData);
};

export const findPendingCompanyJoinRequest = async (senderId, companyId) => {
	return await Notification.findOne({
		senderId: senderId,
		"reference.entityType": "Company",
		"reference.entityId": companyId,
		actionStatus: "Pending",
		type: "Company_Join_Request",
	});
};

export const findPendingProjectJoinRequest = async (senderId, projectId) => {
	return await Notification.findOne({
		senderId: senderId,
		"reference.entityType": "Project",
		"reference.entityId": projectId,
		actionStatus: "Pending",
		type: "Project_Join_Request",
	});
};

export const getUserNotifications = async (userId) => {
	return await Notification.find({ recipientId: userId })
		.populate("senderId", "name email")
		.sort({ createdAt: -1 });
};

export const markAllNotificationsRead = async (userId) => {
	return await Notification.updateMany(
		{ recipientId: userId, isRead: false },
		{ isRead: true },
	);
};

export const findNotificationById = async (notificationId) => {
	return await Notification.findById(notificationId);
};

export const updateNotificationById = async (
	notificationId,
	updates,
	options = {},
) => {
	return await Notification.findByIdAndUpdate(notificationId, updates, {
		new: true,
		...options,
	});
};

export const findCompanyRequestsForAdmin = async (adminId) => {
	return await Notification.find({
		recipientId: adminId,
		type: "Company_Join_Request",
		actionStatus: "Pending",
	})
		.populate("senderId", "name email")
		.sort({ createdAt: -1 });
};

export const findProjectRequestsForAdmin = async (adminId) => {
	return await Notification.find({
		recipientId: adminId,
		type: "Project_Join_Request",
		actionStatus: "Pending",
	})
		.populate("senderId", "name email")
		.sort({ createdAt: -1 });
};