import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		companyId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Companies",
		},
		description: {
			type: String,
			required: false,
		},
		adminId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
	},
	{ timestamps: true },
);

const project = mongoose.model("Project", projectSchema);
export default project;
