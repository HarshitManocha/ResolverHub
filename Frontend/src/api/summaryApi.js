import apiClient from "../lib/apiClient";

export const summaryApi = async (bugId) => {
    const payload = await apiClient.get(`/summary/${bugId}`);
    return payload.data;
};