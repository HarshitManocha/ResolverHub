import crypto from "node:crypto";

import {
	createCompany,
	findCompanyByEmail,
	findCompanyById,
	findCompanyByIdAndDelete,
	findCompanyByIdAndUpdate,
} from "../repositories/companyRepository.js";
import {
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

const publicCompany = (company) => ({
	_id: company._id,
	name: company.name,
	email: company.email,
	inviteCode: company.inviteCode,
	adminId: company.adminId,
	createdAt: company.createdAt,
});

export const registerCompany = async (companyData, userId) => {
	const user = await requireUser(userId);

	if (!companyData?.name?.trim() || !companyData?.email?.trim()) {
		throw badRequest("Company name and email are required");
	}

	if (user.companyId) {
		throw conflict("You are already a member of a company");
	}

	const existingCompany = await findCompanyByEmail(companyData.email);
	if (existingCompany) {
		throw conflict("Company email already in use");
	}

	const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

	return await runInTransaction(async (options) => {
		const company = await createCompany(
			{ name: companyData.name.trim(), email: companyData.email },
			inviteCode,
			userId,
			options,
		);

		const updatedUser = await findUserByIdAndUpdate(
			userId,
			{ companyId: company._id, role: "Admin" },
			options,
		);

		return { company: publicCompany(company), updatedUser };
	});
};

/** Company details for the signed in member, including the invite code for admins. */
export const getMyCompany = async (userId) => {
	const user = await requireUser(userId);

	if (!user.companyId) {
		throw notFound("You are not part of a company yet");
	}

	const company = await findCompanyById(user.companyId);
	if (!company) {
		throw notFound("Company not found");
	}

	const isAdmin = company.adminId.toString() === userId.toString();
	const members = await findUsers({ companyId: company._id });

	return {
		company: {
			_id: company._id,
			name: company.name,
			email: company.email,
			adminId: company.adminId,
			createdAt: company.createdAt,
			// The invite code is the join secret, so only the admin receives it.
			inviteCode: isAdmin ? company.inviteCode : undefined,
		},
		isAdmin,
		memberCount: members.length,
		members,
	};
};

export const getAvailableProjectAdmins = async (userId) => {
	const user = await requireUser(userId);

	if (!user.companyId) {
		throw badRequest("You are not part of a company");
	}

	const company = await findCompanyById(user.companyId);
	if (!company) {
		throw notFound("Company not found");
	}

	if (company.adminId.toString() !== userId.toString()) {
		throw forbidden("Only the company admin can view available members");
	}

	// The company admin is excluded: promoting them to ProjectAdmin would leave
	// the company without anyone able to approve joins or create projects.
	return await findUsers({
		companyId: user.companyId,
		projectId: null,
		_id: { $ne: company.adminId },
	});
};

export const updateCompany = async (companyId, companyData, userId) => {
	const company = await findCompanyById(companyId);
	if (!company) {
		throw notFound("Company not found");
	}

	const companyAdminId = company.adminId.toString();
	if (userId.toString() !== companyAdminId) {
		throw forbidden("You don't have permission to update this company");
	}

	const allowedUpdates = {};
	if (companyData.name?.trim()) {
		allowedUpdates.name = companyData.name.trim();
	}

	const isTransferringAdmin =
		Boolean(companyData.adminId) && companyData.adminId !== companyAdminId;

	if (!isTransferringAdmin) {
		if (Object.keys(allowedUpdates).length === 0) {
			throw badRequest("No valid fields to update");
		}

		const updatedCompany = await findCompanyByIdAndUpdate(
			companyId,
			allowedUpdates,
		);
		return publicCompany(updatedCompany);
	}

	const targetUser = await findUserById(companyData.adminId);
	if (!targetUser) {
		throw notFound("Target user not found");
	}

	if (targetUser.companyId?.toString() !== company._id.toString()) {
		throw badRequest("Target user is not a member of this company");
	}

	allowedUpdates.adminId = companyData.adminId;

	return await runInTransaction(async (options) => {
		const updatedCompany = await findCompanyByIdAndUpdate(
			companyId,
			allowedUpdates,
			options,
		);

		await findUserByIdAndUpdate(
			companyAdminId,
			{ role: "Unassigned" },
			options,
		);
		await findUserByIdAndUpdate(
			companyData.adminId,
			{ role: "Admin" },
			options,
		);

		return publicCompany(updatedCompany);
	});
};

export const deleteCompany = async (companyId, userId) => {
	const company = await findCompanyById(companyId);
	if (!company) {
		throw notFound("Company not found");
	}

	if (userId.toString() !== company.adminId.toString()) {
		throw forbidden("You don't have permission to delete this company");
	}

	return await runInTransaction(async (options) => {
		await updateManyUsers(
			{ companyId },
			{ companyId: null, projectId: null, role: "Unassigned" },
			options,
		);

		await findCompanyByIdAndDelete(companyId, options);

		return { message: "Company and related user references deleted" };
	});
};
