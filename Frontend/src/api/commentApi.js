import apiClient from "../lib/apiClient";

export const fetchComments = async (bugId) => {
	const payload = await apiClient.get(`/comments/${bugId}`);
	return payload.data;
};

export const createComment = async ({ bugId, text }) => {
	const payload = await apiClient.post("/comments", { bugId, text });
	return payload.data;
};
