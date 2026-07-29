import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		inviteCode: {
			type: String,
			required: true,
			unique: true,
		},

		adminId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
	},
	{ timestamps: true },
);

const Company = mongoose.model("Companies", companySchema);

export default Company;
