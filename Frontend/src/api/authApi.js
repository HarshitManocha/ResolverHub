import apiClient from "../lib/apiClient";

export const signup = async ({ name, email, password }) => {
	const payload = await apiClient.post(
		"/auth/signup",
		{ name, email, password },
		{ auth: false },
	);
	return payload.data;
};

export const login = async ({ email, password }) => {
	const payload = await apiClient.post(
		"/auth/login",
		{ email, password },
		{ auth: false },
	);
	return payload.data;
};
