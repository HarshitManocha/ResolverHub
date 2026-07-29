import apiClient from "../lib/apiClient";

export const fetchMyProfile = async () => {
	const payload = await apiClient.get("/profile/me");
	return payload.data;
};

export const updateMyProfile = async (updates) => {
	const payload = await apiClient.put("/profile/update", updates);
	return payload.data;
};

export const changeMyPassword = async ({ oldPassword, newPassword }) => {
	return await apiClient.put("/profile/change-password", {
		oldPassword,
		newPassword,
	});
};
