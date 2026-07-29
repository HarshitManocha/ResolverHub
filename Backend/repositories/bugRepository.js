import Bugs from "../models/bugModel.js";

const withPeople = (query) =>
	query
		.populate("reportedBy", "name email role")
		.populate("assignedTo", "name email role")
		.populate("projectId", "name");

export const createBug = async (bugData) => {
	const bug = await Bugs.create(bugData);
	return await findBugById(bug._id);
};

export const findBugById = async (bugId) => {
	return await withPeople(Bugs.findById(bugId));
};

/** Raw document without populated refs, for ownership checks. */
export const findRawBugById = async (bugId) => {
	return await Bugs.findById(bugId);
};

export const findBugByIdAndUpdate = async (bugId, updates) => {
	return await withPeople(
		Bugs.findByIdAndUpdate(bugId, updates, {
			new: true,
			runValidators: true,
		}),
	);
};

export const findBugByIdandDelete = async (bugId) => {
	return await Bugs.findByIdAndDelete(bugId);
};

export const findBugs = async (filters) => {
	return await withPeople(Bugs.find(filters)).sort({ createdAt: -1 });
};

export const deleteBugsByProject = async (projectId, options = {}) => {
	return await Bugs.deleteMany({ projectId }, options);
};

export const countBugs = async (filter) => {
	return await Bugs.countDocuments(filter);
};
