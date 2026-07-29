import Company from "../models/companyModel.js";

export const createCompany = async (
	companyData,
	inviteCode,
	adminId,
	options = {},
) => {
	const [company] = await Company.create(
		[
			{
				...companyData,
				inviteCode,
				adminId,
			},
		],
		options,
	);
	return company;
};

export const findCompanyByEmail = async (email) => {
	return await Company.findOne({ email });
};

export const findCompanyById = async (companyId) => {
	return await Company.findById(companyId);
};

export const findCompanyByInviteCode = async (inviteCode) => {
	return await Company.findOne({ inviteCode: inviteCode });
};

export const findCompanyByIdAndUpdate = async (
	companyId,
	updates,
	options = {},
) => {
	return await Company.findByIdAndUpdate(companyId, updates, {
		new: true,
		...options,
	});
};

export const findCompanyByIdAndDelete = async (companyId, options = {}) => {
	return await Company.findByIdAndDelete(companyId, options);
};
