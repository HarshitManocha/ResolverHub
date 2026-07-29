import { findCompanyByInviteCode } from "../repositories/companyRepository.js";
import {
	createNotification,
	findCompanyRequestsForAdmin,
	findNotificationById,
	findPendingCompanyJoinRequest,
	findPendingProjectJoinRequest,
	findProjectRequestsForAdmin,
	getUserNotifications,
	markAllNotificationsRead,
	updateNotificationById,
} from "../repositories/notificationRepository.js";
import { findProjectById } from "../repositories/projectRepository.js";
import {
	findUserById,
	findUserByIdAndUpdate,
} from "../repositories/userRepository.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/appError.js";
import { runInTransaction } from "../utils/transaction.js";

const JOIN_TYPES = ["Company_Join_Request", "Project_Join_Request"];
const PROJECT_ROLES = ["Developer", "Tester"];

const requireUser = async (userId) => {
	const user = await findUserById(userId);
	if (!user) {
		throw notFound("User not found");
	}
	return user;
};

export const requestCompanyJoin = async (inviteCode, userId) => {
	const user = await requireUser(userId);

	if (!inviteCode?.trim()) {
		throw badRequest("Invite code is required");
	}

	if (user.companyId) {
		throw conflict("You are already a member of a company");
	}

	const company = await findCompanyByInviteCode(inviteCode.trim().toUpperCase());
	if (!company) {
		throw notFound("Invalid invite code");
	}

	const existingRequest = await findPendingCompanyJoinRequest(
		userId,
		company._id,
	);
	if (existingRequest) {
		throw conflict("You already have a pending request for this company");
	}

	return await createNotification({
		recipientId: company.adminId,
		senderId: userId,
		type: "Company_Join_Request",
		message: `${user.name} has requested to join your workspace: ${company.name}`,
		actionStatus: "Pending",
		reference: { entityType: "Company", entityId: company._id },
	});
};

export const requestProjectJoin = async (projectId, userId) => {
	const user = await requireUser(userId);

	if (!projectId) {
		throw badRequest("Project id is required");
	}

	if (!user.companyId) {
		throw badRequest("Join a company before requesting a project");
	}

	if (user.projectId) {
		throw conflict("You are already a member of a project");
	}

	const project = await findProjectById(projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	if (project.companyId.toString() !== user.companyId.toString()) {
		throw forbidden("This project belongs to another company");
	}

	const existingRequest = await findPendingProjectJoinRequest(
		userId,
		project._id,
	);
	if (existingRequest) {
		throw conflict("You already have a pending request for this project");
	}

	return await createNotification({
		recipientId: project.adminId,
		senderId: userId,
		type: "Project_Join_Request",
		message: `${user.name} has requested to join your project: ${project.name}`,
		actionStatus: "Pending",
		reference: { entityType: "Project", entityId: project._id },
	});
};

export const fetchUserNotifications = async (userId) => {
	await requireUser(userId);
	return await getUserNotifications(userId);
};

export const markAsRead = async (notificationId, userId) => {
	await requireUser(userId);

	const notification = await findNotificationById(notificationId);
	if (!notification) {
		throw notFound("Notification not found");
	}

	if (notification.recipientId.toString() !== userId.toString()) {
		throw forbidden("You cannot modify this notification");
	}

	return await updateNotificationById(notificationId, { isRead: true });
};

export const markAllAsRead = async (userId) => {
	await requireUser(userId);
	await markAllNotificationsRead(userId);
	return { message: "All notifications marked as read" };
};

/** Shared validation for accept/deny of a pending join request. */
const requirePendingJoinRequest = async (notificationId, userId) => {
	const notification = await findNotificationById(notificationId);
	if (!notification) {
		throw notFound("Notification not found");
	}

	if (!JOIN_TYPES.includes(notification.type)) {
		throw badRequest("This notification is not a join request");
	}

	if (notification.actionStatus !== "Pending") {
		throw conflict("This request is no longer pending");
	}

	if (notification.recipientId.toString() !== userId.toString()) {
		throw forbidden("You don't have permission to review this request");
	}

	return notification;
};

export const acceptJoinRequest = async (
	notificationId,
	userId,
	assignedRole = null,
) => {
	await requireUser(userId);
	const notification = await requirePendingJoinRequest(notificationId, userId);

	const sender = await findUserById(notification.senderId);
	if (!sender) {
		throw notFound("The requesting user no longer exists");
	}

	const isCompanyRequest = notification.type === "Company_Join_Request";

	if (isCompanyRequest && sender.companyId) {
		throw conflict("This user has already joined a company");
	}

	if (!isCompanyRequest) {
		if (sender.projectId) {
			throw conflict("This user has already joined a project");
		}
		if (!PROJECT_ROLES.includes(assignedRole)) {
			throw badRequest(
				`Assign a role of ${PROJECT_ROLES.join(" or ")} to accept a project member`,
			);
		}
	}

	const updateData = isCompanyRequest
		? { companyId: notification.reference.entityId }
		: { projectId: notification.reference.entityId, role: assignedRole };

	return await runInTransaction(async (options) => {
		const updatedNotification = await updateNotificationById(
			notificationId,
			{ actionStatus: "Approved", isRead: true },
			options,
		);

		const updatedUser = await findUserByIdAndUpdate(
			notification.senderId,
			{ $set: updateData },
			options,
		);

		return { notification: updatedNotification, user: updatedUser };
	});
};

export const denyJoinRequest = async (notificationId, userId) => {
	await requireUser(userId);
	await requirePendingJoinRequest(notificationId, userId);

	return await updateNotificationById(notificationId, {
		actionStatus: "Declined",
		isRead: true,
	});
};

export const fetchCompanyRequests = async (userId) => {
	const user = await requireUser(userId);

	if (user.role !== "Admin") {
		throw forbidden("Only the company admin can view company join requests");
	}

	return await findCompanyRequestsForAdmin(userId);
};

export const fetchProjectRequests = async (userId) => {
	const user = await requireUser(userId);

	if (user.role !== "ProjectAdmin") {
		throw forbidden("Only the project admin can view project join requests");
	}

	return await findProjectRequestsForAdmin(userId);
};
