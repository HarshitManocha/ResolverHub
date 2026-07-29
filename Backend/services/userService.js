import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import env from "../config/env.js";
import {
	createUser,
	findUserByEmail,
} from "../repositories/userRepository.js";
import { badRequest, conflict, unauthorized } from "../utils/appError.js";

export const toPublicUser = (user) => ({
	_id: user._id,
	name: user.name,
	email: user.email,
	role: user.role,
	companyId: user.companyId ?? null,
	projectId: user.projectId ?? null,
});

export const signUpUser = async ({ name, email, password }) => {
	if (!name?.trim() || !email?.trim() || !password) {
		throw badRequest("Name, email and password are all required");
	}

	if (password.length < 6) {
		throw badRequest("Password must be at least 6 characters long");
	}

	const existingUser = await findUserByEmail(email);
	if (existingUser) {
		throw conflict("An account with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = await createUser({
		name: name.trim(),
		email,
		password: hashedPassword,
	});

	return { user: toPublicUser(newUser) };
};

export const loginUser = async ({ email, password }) => {
	if (!email?.trim() || !password) {
		throw badRequest("Email and password are required");
	}

	const user = await findUserByEmail(email);
	if (!user) {
		throw unauthorized("Invalid email or password");
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw unauthorized("Invalid email or password");
	}

	const token = jwt.sign({ userId: user._id }, env.jwtSecret, {
		expiresIn: env.jwtExpiresIn,
	});

	return { token, user: toPublicUser(user) };
};
