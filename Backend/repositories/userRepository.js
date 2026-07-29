import User from "../models/userModel.js";

const PUBLIC_FIELDS = "-password";

export const findUserByEmail = async (email) => {
	return await User.findOne({ email: String(email ?? "").toLowerCase().trim() });
};

export const findUserById = async (id) => {
	return await User.findById(id).select(PUBLIC_FIELDS);
};

export const createUser = async (userData) => {
	return await User.create(userData);
};

export const findUserByIdAndUpdate = async (userId, updates, options = {}) => {
	return await User.findByIdAndUpdate(userId, updates, {
		new: true,
		runValidators: true,
		...options,
	}).select(PUBLIC_FIELDS);
};

export const findUserByIdWithPassword = async (id) => {
	return await User.findById(id);
};

export const deleteUserById = async (userId) => {
	return await User.findByIdAndDelete(userId);
};

export const findUsers = async (filter) => {
	return await User.find(filter).select(PUBLIC_FIELDS).sort({ name: 1 });
};

export const updateManyUsers = async (filter, updates, options = {}) => {
	return await User.updateMany(filter, updates, options);
};

export const countUsers = async (filter) => {
	return await User.countDocuments(filter);
};
