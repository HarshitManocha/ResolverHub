import {
	createProject,
	deleteProject,
	getAllProjects,
	getAvailableProjectMembers,
	getProject,
	getProjectMembers,
	setProjectMemberRole,
	updateProject,
} from "../services/projectService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createProjectController = asyncHandler(async (req, res) => {
	const data = await createProject(req.body, req.id);
	res.status(201).json({
		success: true,
		message: "Project created successfully",
		data,
	});
});

export const getAllProjectsController = asyncHandler(async (req, res) => {
	const data = await getAllProjects(req.id);
	res.status(200).json({
		success: true,
		message: "Projects fetched successfully",
		data,
	});
});

export const getProjectController = asyncHandler(async (req, res) => {
	const data = await getProject(req.params.id, req.id);
	res.status(200).json({
		success: true,
		message: "Project fetched successfully",
		data,
	});
});

export const getProjectMembersController = asyncHandler(async (req, res) => {
	const data = await getProjectMembers(req.id);
	res.status(200).json({
		success: true,
		message: "Project members fetched successfully",
		data,
	});
});

export const getProjectUnassignedMembersController = asyncHandler(
	async (req, res) => {
		const data = await getAvailableProjectMembers(req.id);
		res.status(200).json({
			success: true,
			message: "Unassigned members fetched successfully",
			data,
		});
	},
);

export const setProjectMemberRoleController = asyncHandler(async (req, res) => {
	const data = await setProjectMemberRole(
		req.params.memberId,
		req.body.role,
		req.id,
	);
	res.status(200).json({
		success: true,
		message: "Member role updated successfully",
		data,
	});
});

export const updateProjectController = asyncHandler(async (req, res) => {
	const data = await updateProject(req.params.id, req.body, req.id);
	res.status(200).json({
		success: true,
		message: "Project updated successfully",
		data,
	});
});

export const deleteProjectController = asyncHandler(async (req, res) => {
	const data = await deleteProject(req.params.id, req.id);
	res.status(200).json({
		success: true,
		message: "Project deleted successfully",
		data,
	});
});
