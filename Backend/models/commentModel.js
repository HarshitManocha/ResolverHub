import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},

		text: {
			type: String,
			required: true,
		},

		bugId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Bugs",
		},

		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Project",
		},

		companyId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Companies",
		},
	},
	{ timestamps: true },
);

const Comments = mongoose.model("Comments", commentSchema);

export default Comments;
