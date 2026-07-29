import {
	countBugs,
	deleteBugsByProject,
} from "../repositories/bugRepository.js";
import {
	createProject as createProjectRepo,
	findProjectByCompanyId,
	findProjectById,
	findProjectByIdAndDelete,
	findProjectByIdAndUpdate,
	findProjectByName,
} from "../repositories/projectRepository.js";
import {
	countUsers,
	findUserById,
	findUserByIdAndUpdate,
	findUsers,
	updateManyUsers,
} from "../repositories/userRepository.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/appError.js";
import { runInTransaction } from "../utils/transaction.js";

const requireUser = async (userId) => {
	const user = await findUserById(userId);
	if (!user) {
		throw notFound("User not found");
	}
	return user;
};

const requireCompanyMember = async (userId) => {
	const user = await requireUser(userId);
	if (!user.companyId) {
		throw badRequest("You don't belong to a company yet");
	}
	return user;
};

export const createProject = async (projectData, userId) => {
	const user = await requireCompanyMember(userId);

	if (user.role !== "Admin") {
		throw forbidden("Only the company admin can create projects");
	}

	if (!projectData?.name?.trim()) {
		throw badRequest("Project name is required");
	}

	const name = projectData.name.trim();

	if (await findProjectByName(name, user.companyId)) {
		throw conflict("A project with this name already exists");
	}

	if (!projectData.adminId) {
		throw badRequest("Please select a project admin");
	}

	const projectAdmin = await findUserById(projectData.adminId);
	if (!projectAdmin) {
		throw notFound("Selected project admin not found");
	}

	if (projectAdmin.companyId?.toString() !== user.companyId.toString()) {
		throw badRequest("Selected user does not belong to your company");
	}

	if (projectAdmin.projectId) {
		throw conflict("Selected user already belongs to another project");
	}

	// Promoting the company admin would strip their Admin role and lock the
	// company out of approving joins and creating further projects.
	if (projectAdmin._id.toString() === userId.toString()) {
		throw badRequest(
			"You cannot make yourself the project admin. Invite a teammate first.",
		);
	}

	return await runInTransaction(async (options) => {
		const projectCreated = await createProjectRepo(
			{
				name,
				description: projectData.description?.trim() ?? "",
				adminId: projectData.adminId,
				companyId: user.companyId,
			},
			options,
		);

		const updatedUser = await findUserByIdAndUpdate(
			projectData.adminId,
			{ projectId: projectCreated._id, role: "ProjectAdmin" },
			options,
		);

		return { projectCreated, updatedUser };
	});
};

export const updateProject = async (projectId, projectData, userId) => {
	const project = await findProjectById(projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	const user = await requireCompanyMember(userId);

	if (project.companyId.toString() !== user.companyId.toString()) {
		throw forbidden("This project belongs to another company");
	}

	const isCompanyAdmin = user.role === "Admin";
	const isProjectAdmin = project.adminId.toString() === userId.toString();

	if (!isCompanyAdmin && !isProjectAdmin) {
		throw forbidden("Only the company admin or project admin can edit a project");
	}

	const allowedUpdates = {};
	if (projectData.name?.trim()) allowedUpdates.name = projectData.name.trim();
	if (projectData.description !== undefined) {
		allowedUpdates.description = projectData.description.trim();
	}

	if (Object.keys(allowedUpdates).length === 0) {
		throw badRequest("No valid fields to update");
	}

	return await findProjectByIdAndUpdate(projectId, allowedUpdates);
};

export const deleteProject = async (projectId, userId) => {
	const project = await findProjectById(projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	const user = await requireCompanyMember(userId);

	if (user.role !== "Admin") {
		throw forbidden("Only the company admin can delete projects");
	}

	if (project.companyId.toString() !== user.companyId.toString()) {
		throw forbidden("This project belongs to another company");
	}

	await runInTransaction(async (options) => {
		// Members of a deleted project lose their project scoped role too.
		await updateManyUsers(
			{ projectId },
			{ projectId: null, role: "Unassigned" },
			options,
		);
		await deleteBugsByProject(projectId, options);
		await findProjectByIdAndDelete(projectId, options);
	});

	return { message: "Project deleted" };
};

export const getProject = async (projectId, userId) => {
	const project = await findProjectById(projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	const user = await requireCompanyMember(userId);

	if (project.companyId.toString() !== user.companyId.toString()) {
		throw forbidden("This project belongs to another company");
	}

	return project;
};

export const getAllProjects = async (userId) => {
	const user = await requireCompanyMember(userId);
	const projects = await findProjectByCompanyId(user.companyId);

	return await Promise.all(
		projects.map(async (project) => {
			const [memberCount, bugCount] = await Promise.all([
				countUsers({ projectId: project._id }),
				countBugs({ projectId: project._id }),
			]);

			return { ...project.toObject(), memberCount, bugCount };
		}),
	);
};

/** Everyone assigned to the caller's project. */
export const getProjectMembers = async (userId) => {
	const user = await requireCompanyMember(userId);

	if (!user.projectId) {
		throw badRequest("You are not assigned to a project");
	}

	return await findUsers({ projectId: user.projectId });
};

/** Project members who still need a Developer/Tester role. */
export const getAvailableProjectMembers = async (userId) => {
	const user = await requireCompanyMember(userId);

	if (!user.projectId) {
		throw badRequest("You are not assigned to a project");
	}

	const project = await findProjectById(user.projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	if (project.adminId.toString() !== userId.toString()) {
		throw forbidden("Only the project admin can view unassigned members");
	}

	return await findUsers({ projectId: user.projectId, role: "Unassigned" });
};

/** Project admin assigns Developer/Tester to a member of their project. */
export const setProjectMemberRole = async (memberId, role, userId) => {
	const user = await requireCompanyMember(userId);

	if (!user.projectId) {
		throw badRequest("You are not assigned to a project");
	}

	const project = await findProjectById(user.projectId);
	if (!project) {
		throw notFound("Project not found");
	}

	if (project.adminId.toString() !== userId.toString()) {
		throw forbidden("Only the project admin can change member roles");
	}

	if (!["Developer", "Tester"].includes(role)) {
		throw badRequest("Role must be either Developer or Tester");
	}

	const member = await findUserById(memberId);
	if (!member) {
		throw notFound("Member not found");
	}

	if (member.projectId?.toString() !== project._id.toString()) {
		throw badRequest("This user is not a member of your project");
	}

	if (member._id.toString() === userId.toString()) {
		throw badRequest("You cannot change your own role");
	}

	return await findUserByIdAndUpdate(memberId, { role });
};
