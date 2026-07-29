import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
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

		password: {
			type: String,
			required: true,
		},

		companyId: {
			type: mongoose.Schema.Types.ObjectId,
			default: null,
			ref: "Companies",
		},

		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
			default: null,
		},

		role: {
			type: String,
			enum: [
				"Admin",
				"ProjectAdmin",
				"Developer",
				"Tester",
				"Unassigned",
			],
			default: "Unassigned",
		},
	},
	{ timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
