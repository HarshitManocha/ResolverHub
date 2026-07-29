import { getAiSummary } from "../services/aiService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const aiSummaryController = asyncHandler(async (req, res) => {
	const data = await getAiSummary(req.params.id);
	res.status(200).json({
		success: true,
		message: "Summarized  successfully",
		data,
	});
});