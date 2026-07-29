import {
	deleteBug,
	getAllBugs,
	getBug,
	registerBug,
	updateBug,
} from "../services/bugService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const registerBugController = asyncHandler(async (req, res) => {
	const data = await registerBug(req.body, req.id);
	res.status(201).json({
		success: true,
		message: "Bug reported successfully",
		data,
	});
});

export const getAllBugController = asyncHandler(async (req, res) => {
	const data = await getAllBugs(req.query, req.id);
	res.status(200).json({
		success: true,
		message: "Bugs fetched successfully",
		data,
	});
});

export const getBugController = asyncHandler(async (req, res) => {
	const data = await getBug(req.params.id, req.id);
	res.status(200).json({
		success: true,
		message: "Bug fetched successfully",
		data,
	});
});

export const updateBugController = asyncHandler(async (req, res) => {
	const data = await updateBug(req.params.id, req.body, req.id);
	res.status(200).json({
		success: true,
		message: "Bug updated successfully",
		data,
	});
});

export const deleteBugController = asyncHandler(async (req, res) => {
	const data = await deleteBug(req.params.id, req.id);
	res.status(200).json({
		success: true,
		message: "Bug deleted successfully",
		data,
	});
});
