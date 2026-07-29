import { comment, getComments } from "../services/commentService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
	const data = await comment(req.body, req.id);
	res.status(201).json({
		success: true,
		message: "Comment added successfully",
		data,
	});
});

export const get = asyncHandler(async (req, res) => {
	const data = await getComments(req.params.bugId, req.id);
	res.status(200).json({
		success: true,
		message: "Comments fetched successfully",
		data,
	});
});
