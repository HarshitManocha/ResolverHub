import { findRawBugById } from "../repositories/bugRepository.js";
import {
	createComment,
	findCommentsByBugId,
} from "../repositories/commentRepository.js";
import { findProjectById } from "../repositories/projectRepository.js";
import { findUserById } from "../repositories/userRepository.js";
import { badRequest, forbidden, notFound } from "../utils/appError.js";

/**
 * Comments live inside a project, so the caller must belong to the bug's project
 * (company admins get read/write access to their own company's bugs as well).
 */
const requireCommentAccess = async (bugId, userId) => {
	const user = await findUserById(userId);
	if (!user) {
		throw notFound("User not found");
	}

	const bug = await findRawBugById(bugId);
	if (!bug) {
		throw notFound("Bug not found");
	}

	const project = await findProjectById(bug.projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	if (user.companyId?.toString() !== project.companyId.toString()) {
		throw forbidden("You are not a part of this company");
	}

	const isCompanyAdmin = user.role === "Admin";
	const isProjectMember =
		user.projectId?.toString() === project._id.toString();

	if (!isCompanyAdmin && !isProjectMember) {
		throw forbidden("You are not a part of this project");
	}

	return { user, bug, project };
};

export const comment = async (commentData, userId) => {
	if (!commentData?.bugId) {
		throw badRequest("bugId is required");
	}

	if (!commentData?.text?.trim()) {
		throw badRequest("Comment text cannot be empty");
	}

	const { bug, project } = await requireCommentAccess(commentData.bugId, userId);

	return await createComment({
		senderId: userId,
		bugId: bug._id,
		projectId: project._id,
		companyId: project.companyId,
		text: commentData.text.trim(),
	});
};

export const getComments = async (bugId, userId) => {
	const { bug } = await requireCommentAccess(bugId, userId);
	return await findCommentsByBugId(bug._id);
};
