import apiClient from "../lib/apiClient";

export const createCompany = async ({ name, email }) => {
	const payload = await apiClient.post("/company", { name, email });
	return payload.data;
};

export const fetchMyCompany = async () => {
	const payload = await apiClient.get("/company/me");
	return payload.data;
};

/** Company members who are not attached to a project yet. */
export const fetchUnassignedCompanyMembers = async () => {
	const payload = await apiClient.get("/company/free-members");
	return payload.data;
};

export const updateCompany = async (companyId, updates) => {
	const payload = await apiClient.put(`/company/${companyId}`, updates);
	return payload.data;
};
