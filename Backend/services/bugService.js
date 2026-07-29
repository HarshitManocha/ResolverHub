import {
	createBug,
	findBugById,
	findBugByIdandDelete,
	findBugByIdAndUpdate,
	findBugs,
	findRawBugById,
} from "../repositories/bugRepository.js";
import { deleteCommentsByBugId } from "../repositories/commentRepository.js";
import { findProjectById } from "../repositories/projectRepository.js";
import { findUserById } from "../repositories/userRepository.js";
import { badRequest, forbidden, notFound } from "../utils/appError.js";

const STATUSES = ["Open", "InProgress", "Resolved", "Closed"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const requireUser = async (userId) => {
	const user = await findUserById(userId);
	if (!user) {
		throw notFound("User not found");
	}
	if (!user.companyId) {
		throw badRequest("You don't belong to a company yet");
	}
	return user;
};

/**
 * Loads a bug and checks the caller may see it. Company admins can read any bug
 * in their company; everyone else is limited to their own project.
 */
const requireBugAccess = async (bugId, userId) => {
	const bug = await findRawBugById(bugId);
	if (!bug) {
		throw notFound("Bug not found");
	}

	const user = await requireUser(userId);

	if (bug.companyId.toString() !== user.companyId.toString()) {
		throw forbidden("This bug belongs to another company");
	}

	const isCompanyAdmin = user.role === "Admin";
	const isProjectMember =
		Boolean(user.projectId) &&
		bug.projectId.toString() === user.projectId.toString();

	if (!isCompanyAdmin && !isProjectMember) {
		throw forbidden("You don't have access to this bug");
	}

	return { bug, user };
};

export const registerBug = async (bugData, userId) => {
	const user = await requireUser(userId);

	if (user.role !== "Tester") {
		throw forbidden("Only testers can report bugs");
	}

	if (!bugData?.title?.trim() || !bugData?.description?.trim()) {
		throw badRequest("Bug title and description are required");
	}

	if (bugData.priority && !PRIORITIES.includes(bugData.priority)) {
		throw badRequest(`Priority must be one of: ${PRIORITIES.join(", ")}`);
	}

	// A tester can only file bugs against the project they belong to.
	const projectId = bugData.projectId ?? user.projectId;
	if (!projectId) {
		throw badRequest("You are not assigned to a project");
	}

	const project = await findProjectById(projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	if (project.companyId.toString() !== user.companyId.toString()) {
		throw forbidden("This project belongs to another company");
	}

	if (user.projectId?.toString() !== project._id.toString()) {
		throw forbidden("You are not assigned to this project");
	}

	return await createBug({
		title: bugData.title.trim(),
		description: bugData.description.trim(),
		priority: bugData.priority ?? "Medium",
		projectId: project._id,
		companyId: user.companyId,
		reportedBy: userId,
		assignedTo: null,
	});
};

export const getBug = async (bugId, userId) => {
	const { bug } = await requireBugAccess(bugId, userId);
	return await findBugById(bug._id);
};

export const getAllBugs = async (filters, userId) => {
	const user = await requireUser(userId);

	const query = { companyId: user.companyId };

	if (user.role === "Admin") {
		// Company admins are not in a project, so they must name one.
		if (!filters.projectId) {
			throw badRequest("Company admins must provide a projectId filter");
		}

		const project = await findProjectById(filters.projectId);
		if (!project) {
			throw notFound("Project not found");
		}
		if (project.companyId.toString() !== user.companyId.toString()) {
			throw forbidden("This project belongs to another company");
		}

		query.projectId = project._id;
	} else {
		if (!user.projectId) {
			throw badRequest("You are not assigned to a project");
		}
		query.projectId = user.projectId;
	}

	if (filters.status) {
		if (!STATUSES.includes(filters.status)) {
			throw badRequest(`Status must be one of: ${STATUSES.join(", ")}`);
		}
		query.status = filters.status;
	}

	if (filters.priority) {
		if (!PRIORITIES.includes(filters.priority)) {
			throw badRequest(`Priority must be one of: ${PRIORITIES.join(", ")}`);
		}
		query.priority = filters.priority;
	}

	if (filters.assignedTo) {
		query.assignedTo =
			filters.assignedTo === "unassigned" ? null : filters.assignedTo;
	}

	return await findBugs(query);
};

const resolveAssignee = async (assignedTo, bug) => {
	if (assignedTo === null || assignedTo === "") {
		return null;
	}

	const assignee = await findUserById(assignedTo);
	if (!assignee) {
		throw notFound("Assignee not found");
	}

	if (assignee.projectId?.toString() !== bug.projectId.toString()) {
		throw badRequest("You can only assign bugs to members of this project");
	}

	if (!["Developer", "ProjectAdmin"].includes(assignee.role)) {
		throw badRequest("Bugs can only be assigned to developers");
	}

	return assignee._id;
};

export const updateBug = async (bugId, bugData, userId) => {
	const { bug, user } = await requireBugAccess(bugId, userId);

	if (bugData.status && !STATUSES.includes(bugData.status)) {
		throw badRequest(`Status must be one of: ${STATUSES.join(", ")}`);
	}

	if (bugData.priority && !PRIORITIES.includes(bugData.priority)) {
		throw badRequest(`Priority must be one of: ${PRIORITIES.join(", ")}`);
	}

	const allowedUpdates = {};

	if (user.role === "Tester") {
		if (bugData.assignedTo !== undefined) {
			throw forbidden("Testers cannot assign bugs");
		}

		if (bug.reportedBy.toString() !== userId.toString()) {
			throw forbidden("Testers can only edit the bugs they reported");
		}

		if (bugData.status && !["Open", "Closed"].includes(bugData.status)) {
			throw forbidden("Testers can only set the status to Open or Closed");
		}

		if (bugData.title?.trim()) allowedUpdates.title = bugData.title.trim();
		if (bugData.description?.trim()) {
			allowedUpdates.description = bugData.description.trim();
		}
		if (bugData.priority) allowedUpdates.priority = bugData.priority;
		if (bugData.status) allowedUpdates.status = bugData.status;
	} else if (user.role === "Developer") {
		if (!bugData.status) {
			throw forbidden("Developers can only update the bug status");
		}

		if (!["InProgress", "Resolved"].includes(bugData.status)) {
			throw forbidden(
				"Developers can only set the status to InProgress or Resolved",
			);
		}

		allowedUpdates.status = bugData.status;
	} else if (user.role === "ProjectAdmin") {
		if (bugData.title?.trim()) allowedUpdates.title = bugData.title.trim();
		if (bugData.description?.trim()) {
			allowedUpdates.description = bugData.description.trim();
		}
		if (bugData.priority) allowedUpdates.priority = bugData.priority;
		if (bugData.status) allowedUpdates.status = bugData.status;

		if (bugData.assignedTo !== undefined) {
			allowedUpdates.assignedTo = await resolveAssignee(
				bugData.assignedTo,
				bug,
			);
		}
	} else {
		throw forbidden("Your role does not allow editing bugs");
	}

	if (Object.keys(allowedUpdates).length === 0) {
		throw badRequest("No valid fields to update");
	}

	return await findBugByIdAndUpdate(bugId, allowedUpdates);
};

export const deleteBug = async (bugId, userId) => {
	const { bug, user } = await requireBugAccess(bugId, userId);

	if (user.role !== "ProjectAdmin") {
		throw forbidden("Only the project admin can delete bugs");
	}

	await deleteCommentsByBugId(bug._id);
	await findBugByIdandDelete(bug._id);

	return { message: "Bug deleted successfully" };
};
