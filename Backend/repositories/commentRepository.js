import Comment from "../models/commentModel.js";

export const createComment = async (commentData) => {
	const comment = await Comment.create(commentData);
	return await comment.populate("senderId", "name email role");
};

export const findCommentsByBugId = async (bugId) => {
	return await Comment.find({ bugId })
		.populate("senderId", "name email role")
		.sort({ createdAt: 1 });
};

export const deleteCommentsByBugId = async (bugId, options = {}) => {
	return await Comment.deleteMany({ bugId }, options);
};
