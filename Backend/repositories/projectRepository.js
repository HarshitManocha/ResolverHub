import Project from "../models/projectModel.js";

export const createProject = async (projectData, options = {}) => {
	const [created] = await Project.create([projectData], options);
	return created;
};

export const findProjectById = async (projectId) => {
	return await Project.findById(projectId);
};

export const findProjectByName = async (name, companyId) => {
	return await Project.findOne({ name, companyId });
};

export const findProjectByCompanyId = async (companyId) => {
	return await Project.find({ companyId })
		.populate("adminId", "name email role")
		.sort({ createdAt: -1 });
};

export const findProjectByIdAndUpdate = async (
	projectId,
	updates,
	options = {},
) => {
	return await Project.findByIdAndUpdate(projectId, updates, {
		new: true,
		runValidators: true,
		...options,
	});
};

export const findProjectByIdAndDelete = async (projectId, options = {}) => {
	return await Project.findByIdAndDelete(projectId, options);
};
