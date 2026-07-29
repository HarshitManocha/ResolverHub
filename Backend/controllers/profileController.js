import {
	changeUserPassword,
	getUserProfile,
	updateUserProfile,
} from "../services/profileService.js";
import { toPublicUser } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMe = asyncHandler(async (req, res) => {
	const user = await getUserProfile(req.id);
	res.status(200).json({
		success: true,
		message: "Profile fetched successfully",
		data: toPublicUser(user),
	});
});

export const updateProfile = asyncHandler(async (req, res) => {
	const updatedUser = await updateUserProfile(req.id, req.body);
	res.status(200).json({
		success: true,
		message: "Profile updated successfully",
		data: toPublicUser(updatedUser),
	});
});

export const changePassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	await changeUserPassword(req.id, oldPassword, newPassword);
	res.status(200).json({
		success: true,
		message: "Password changed successfully",
	});
});
