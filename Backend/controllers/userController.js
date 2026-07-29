import { loginUser, signUpUser } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
	const data = await signUpUser(req.body);
	res.status(201).json({
		success: true,
		message: "Account created successfully",
		data,
	});
});

export const login = asyncHandler(async (req, res) => {
	const data = await loginUser(req.body);
	res.status(200).json({
		success: true,
		message: "Logged in successfully",
		data,
	});
});
