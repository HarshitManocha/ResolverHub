import bcrypt from "bcrypt";

import {
	findUserById,
	findUserByIdAndUpdate,
	findUserByIdWithPassword,
} from "../repositories/userRepository.js";
import { badRequest, notFound, unauthorized } from "../utils/appError.js";

export const getUserProfile = async (userId) => {
	const user = await findUserById(userId);
	if (!user) {
		throw notFound("User not found");
	}
	return user;
};

export const updateUserProfile = async (userId, updates) => {
	const allowedUpdates = {};

	if (updates.name !== undefined) {
		if (!updates.name.trim()) {
			throw badRequest("Name cannot be empty");
		}
		allowedUpdates.name = updates.name.trim();
	}

	if (Object.keys(allowedUpdates).length === 0) {
		throw badRequest("No valid fields to update");
	}

	const updatedUser = await findUserByIdAndUpdate(userId, allowedUpdates);
	if (!updatedUser) {
		throw notFound("User not found");
	}
	return updatedUser;
};

export const changeUserPassword = async (userId, oldPassword, newPassword) => {
	if (!oldPassword || !newPassword) {
		throw badRequest("Current and new password are both required");
	}

	if (newPassword.length < 6) {
		throw badRequest("New password must be at least 6 characters long");
	}

	if (oldPassword === newPassword) {
		throw badRequest("New password must be different from the current one");
	}

	const user = await findUserByIdWithPassword(userId);
	if (!user) {
		throw notFound("User not found");
	}

	const isMatch = await bcrypt.compare(oldPassword, user.password);
	if (!isMatch) {
		throw unauthorized("Current password is incorrect");
	}

	const hashedPassword = await bcrypt.hash(newPassword, 10);
	return await findUserByIdAndUpdate(userId, { password: hashedPassword });
};
