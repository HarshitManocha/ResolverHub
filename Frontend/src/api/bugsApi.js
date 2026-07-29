import apiClient from "../lib/apiClient";

/** `filters` accepts projectId, status, priority and assignedTo. */
export const fetchAllBugs = async (filters = {}) => {
	const payload = await apiClient.get("/bugs", { params: filters });
	return payload.data;
};

export const fetchBug = async (bugId) => {
	const payload = await apiClient.get(`/bugs/${bugId}`);
	return payload.data;
};

export const createBug = async ({ title, description, priority, projectId }) => {
	const payload = await apiClient.post("/bugs", {
		title,
		description,
		priority,
		projectId,
	});
	return payload.data;
};

export const updateBug = async (bugId, updates) => {
	const payload = await apiClient.patch(`/bugs/${bugId}`, updates);
	return payload.data;
};

export const deleteBug = async (bugId) => {
	return await apiClient.delete(`/bugs/${bugId}`);
};
