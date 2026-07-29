import apiClient from "../lib/apiClient";

export const fetchAllProjects = async () => {
	const payload = await apiClient.get("/projects/all");
	return payload.data;
};

export const fetchProject = async (projectId) => {
	const payload = await apiClient.get(`/projects/${projectId}`);
	return payload.data;
};

export const createProject = async ({ name, description, adminId }) => {
	const payload = await apiClient.post("/projects/create", {
		name,
		description,
		adminId,
	});
	return payload.data;
};

export const updateProject = async (projectId, updates) => {
	const payload = await apiClient.put(`/projects/${projectId}`, updates);
	return payload.data;
};

export const deleteProject = async (projectId) => {
	return await apiClient.delete(`/projects/${projectId}`);
};

/** Everyone assigned to the caller's project. */
export const fetchProjectMembers = async () => {
	const payload = await apiClient.get("/projects/members");
	return payload.data;
};

/** Project members still waiting for a Developer/Tester role. */
export const fetchUnassignedProjectMembers = async () => {
	const payload = await apiClient.get("/projects/free-members");
	return payload.data;
};

export const setProjectMemberRole = async (memberId, role) => {
	const payload = await apiClient.patch(`/projects/members/${memberId}/role`, {
		role,
	});
	return payload.data;
};
