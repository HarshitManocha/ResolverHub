import {
	deleteCompany,
	getAvailableProjectAdmins,
	getMyCompany,
	registerCompany,
	updateCompany,
} from "../services/companyService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
	const data = await registerCompany(req.body, req.id);
	res.status(201).json({
		success: true,
		message: "Company created successfully",
		data,
	});
});

export const getMine = asyncHandler(async (req, res) => {
	const data = await getMyCompany(req.id);
	res.status(200).json({
		success: true,
		message: "Company fetched successfully",
		data,
	});
});

export const getProjectAdmins = asyncHandler(async (req, res) => {
	const data = await getAvailableProjectAdmins(req.id);
	res.status(200).json({
		success: true,
		message: "Available members fetched successfully",
		data,
	});
});

export const update = asyncHandler(async (req, res) => {
	const data = await updateCompany(req.params.companyId, req.body, req.id);
	res.status(200).json({
		success: true,
		message: "Company updated successfully",
		data,
	});
});

export const remove = asyncHandler(async (req, res) => {
	const data = await deleteCompany(req.params.companyId, req.id);
	res.status(200).json({
		success: true,
		message: "Company deleted successfully",
		data,
	});
});
