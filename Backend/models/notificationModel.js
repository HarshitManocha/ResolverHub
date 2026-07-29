import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		type: {
			type: String,
			enum: [
				"Company_Join_Request",
				"Project_Join_Request",
				"Bug_Status_Updated",
				"Bug_Comment_Added",
				"General_Alert",
			],
			required: true,
		},

		message: {
			type: String,
			required: true,
		},

		isRead: {
			type: Boolean,
			default: false,
		},

		actionStatus: {
			type: String,
			enum: ["Pending", "Approved", "Declined", "NA"],
			default: "NA",
		},

		reference: {
			entityType: {
				type: String,
				enum: ["Company", "Project", "Bug", "None"],
				default: "None",
			},
			entityId: {
				type: mongoose.Schema.Types.ObjectId,
				default: null,
			},
		},
	},
	{ timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
