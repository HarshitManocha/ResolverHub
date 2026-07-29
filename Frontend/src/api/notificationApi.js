import apiClient from "../lib/apiClient";

export const fetchNotifications = async () => {
	const payload = await apiClient.get("/notifications");
	return payload.data;
};

export const fetchCompanyRequests = async () => {
	const payload = await apiClient.get("/notifications/company-requests");
	return payload.data;
};

export const fetchProjectRequests = async () => {
	const payload = await apiClient.get("/notifications/project-requests");
	return payload.data;
};

export const requestToJoinCompany = async (inviteCode) => {
	const payload = await apiClient.post("/notifications/company/join", {
		inviteCode,
	});
	return payload.data;
};

export const requestToJoinProject = async (projectId) => {
	const payload = await apiClient.post("/notifications/project/join", {
		projectId,
	});
	return payload.data;
};

export const markNotificationRead = async (notificationId) => {
	const payload = await apiClient.patch(
		`/notifications/${notificationId}/read`,
	);
	return payload.data;
};

export const markAllNotificationsRead = async () => {
	return await apiClient.patch("/notifications/read-all");
};

/** `role` is required for project join requests and ignored for company ones. */
export const acceptRequest = async (notificationId, role) => {
	const payload = await apiClient.patch(
		`/notifications/${notificationId}/accept`,
		role ? { role } : {},
	);
	return payload.data;
};

export const denyRequest = async (notificationId) => {
	const payload = await apiClient.patch(`/notifications/${notificationId}/deny`);
	return payload.data;
};
