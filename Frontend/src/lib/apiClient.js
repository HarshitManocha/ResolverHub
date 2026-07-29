import useAuthStore from "../stores/authStore";

const RAW_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

export class ApiError extends Error {
	constructor(message, status) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

const buildUrl = (path, params) => {
	const url = `${API_BASE_URL}${path}`;

	const entries = Object.entries(params ?? {}).filter(
		([, value]) => value !== undefined && value !== null && value !== "",
	);

	if (entries.length === 0) return url;

	const query = new URLSearchParams(entries).toString();
	return `${url}${url.includes("?") ? "&" : "?"}${query}`;
};

// The API always answers with JSON, but a proxy error or a crash can return
// HTML or an empty body, so never assume response.json() will succeed.
const readBody = async (response) => {
	const text = await response.text();
	if (!text) return null;

	try {
		return JSON.parse(text);
	} catch {
		return { message: text.slice(0, 200) };
	}
};

const request = async (
	path,
	{ method = "GET", body, params, auth = true } = {},
) => {
	const headers = {};

	if (body !== undefined) {
		headers["Content-Type"] = "application/json";
	}

	if (auth) {
		const { token } = useAuthStore.getState();
		if (token) headers.Authorization = `Bearer ${token}`;
	}

	let response;
	try {
		response = await fetch(buildUrl(path, params), {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch {
		throw new ApiError(
			"Cannot reach the server. Make sure the API is running.",
			0,
		);
	}

	const payload = await readBody(response);

	if (!response.ok || payload?.success === false) {
		// An expired or tampered token can only be resolved by signing in again.
		if (response.status === 401 && auth) {
			useAuthStore.getState().logout();
		}

		throw new ApiError(
			payload?.message ?? `Request failed with status ${response.status}`,
			response.status,
		);
	}

	return payload;
};

export const apiClient = {
	get: (path, options) => request(path, { ...options, method: "GET" }),
	post: (path, body, options) => request(path, { ...options, method: "POST", body }),
	put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
	patch: (path, body, options) =>
		request(path, { ...options, method: "PATCH", body }),
	delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export default apiClient;
