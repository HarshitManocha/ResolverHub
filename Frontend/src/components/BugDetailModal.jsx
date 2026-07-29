import { Bug, MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { deleteBug, updateBug } from "../api/bugsApi";
import { createComment, fetchComments } from "../api/commentApi";
import { summaryApi } from "../api/summaryApi";
import useAsyncData from "../hooks/useAsyncData";
import {
	ALLOWED_STATUS_BY_ROLE,
	BUG_PRIORITIES,
	PRIORITY_STYLES,
	ROLE_LABELS,
	STATUS_LABELS,
	STATUS_STYLES,
} from "../lib/constants";
import { formatDateTime, formatRelativeTime, shortId } from "../lib/format";
import { controlClass, labelClass } from "../lib/styles";

import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import Spinner from "./ui/Spinner";

const MetaRow = ({ label, children }) => (
	<div className="flex items-baseline gap-2 text-xs">
		<span className="w-24 shrink-0 font-semibold uppercase tracking-wider text-slate-400">
			{label}
		</span>
		<span className="min-w-0 flex-1 text-slate-700">{children}</span>
	</div>
);

const CommentThread = ({ comments, isLoading, currentUserId }) => {
	if (isLoading) {
		return (
			<div className="flex items-center gap-2 py-6 text-xs text-slate-400">
				<Spinner size="xs" />
				Loading comments...
			</div>
		);
	}

	if (comments.length === 0) {
		return (
			<p className="py-6 text-center text-xs text-slate-400">
				No comments yet. Start the discussion below.
			</p>
		);
	}

	return (
		<ul className="scrollbar-slim max-h-64 space-y-4 overflow-y-auto pr-1">
			{comments.map((comment) => {
				const isMine = comment.senderId?._id === currentUserId;

				return (
					<li key={comment._id} className="flex gap-3">
						<Avatar name={comment.senderId?.name} size="sm" />
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-baseline gap-2">
								<span className="text-xs font-bold text-slate-800">
									{comment.senderId?.name ?? "Unknown"}
									{isMine && (
										<span className="ml-1 text-slate-400">
											(you)
										</span>
									)}
								</span>
								<span className="text-[10px] text-slate-400">
									{formatRelativeTime(comment.createdAt)}
								</span>
							</div>
							<p className="mt-1 whitespace-pre-wrap wrap-break-word rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
								{comment.text}
							</p>
						</div>
					</li>
				);
			})}
		</ul>
	);
};

const BugDetailModal = ({
	bug,
	onClose,
	onUpdated,
	onDeleted,
	members = [],
	currentUser,
}) => {
	const [commentText, setCommentText] = useState("");
	const [isSendingComment, setIsSendingComment] = useState(false);
	const [pendingField, setPendingField] = useState(null);
	const [showSummary, setShowSummary] = useState(false);
	const [summary, setSummary] = useState("");

	const role = currentUser?.role;
	const isProjectAdmin = role === "ProjectAdmin";
	const isReporter = bug.reportedBy?._id === currentUser?._id;

	useEffect(() => {
		const fetchSummary = async () => {
			const aiData = await summaryApi(bug._id);
			setSummary(aiData);
		};
		if (showSummary) {
			fetchSummary();
		}
	}, [showSummary, bug._id]);

	// Testers may only touch bugs they filed; the API enforces the same rule.
	const statusOptions =
		role === "Tester" && !isReporter
			? []
			: (ALLOWED_STATUS_BY_ROLE[role] ?? []);

	const canEditPriority = isProjectAdmin || (role === "Tester" && isReporter);

	const assignableMembers = members.filter((member) =>
		["Developer", "ProjectAdmin"].includes(member.role),
	);

	const commentLoader = useCallback(() => fetchComments(bug._id), [bug._id]);
	const {
		data: commentData,
		isLoading: isLoadingComments,
		setData: setComments,
	} = useAsyncData(commentLoader);

	const comments = commentData ?? [];

	const applyUpdate = async (field, updates, successMessage) => {
		setPendingField(field);
		try {
			const updatedBug = await updateBug(bug._id, updates);
			onUpdated(updatedBug);
			toast.success(successMessage);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setPendingField(null);
		}
	};

	const handleDelete = async () => {
		const confirmed = window.confirm(
			`Delete "${bug.title}"? This also removes its comments.`,
		);
		if (!confirmed) return;

		setPendingField("delete");
		try {
			await deleteBug(bug._id);
			toast.success("Bug deleted");
			onDeleted(bug._id);
		} catch (error) {
			toast.error(error.message);
			setPendingField(null);
		}
	};

	const handleAddComment = async (event) => {
		event.preventDefault();

		const text = commentText.trim();
		if (!text) return;

		setIsSendingComment(true);
		try {
			const created = await createComment({ bugId: bug._id, text });
			setComments((current) => [...(current ?? []), created]);
			setCommentText("");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsSendingComment(false);
		}
	};

	return (
		<Modal
			isOpen
			onClose={onClose}
			title="Bug Details"
			icon={Bug}
			size="lg"
		>
			<div className="space-y-6">
				<div>
					<div className="flex flex-wrap items-start justify-between gap-3">
						<h3 className="text-lg font-bold leading-snug text-slate-900">
							{bug.title}
						</h3>
						<div className="flex shrink-0 items-center gap-2">
							<Badge
								className={
									STATUS_STYLES[bug.status] ??
									STATUS_STYLES.Open
								}
							>
								{STATUS_LABELS[bug.status] ?? bug.status}
							</Badge>
							<Badge
								className={
									PRIORITY_STYLES[bug.priority] ??
									PRIORITY_STYLES.Medium
								}
							>
								{bug.priority}
							</Badge>
						</div>
					</div>

					<p className="mt-3 whitespace-pre-wrap wrap-break-word rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
						{bug.description || "No description provided."}
					</p>

					<div className="mt-4 flex justify-center align-middle">
						{!showSummary && (
							<button
								type="button"
								onClick={() => setShowSummary((prev) => !prev)}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
							>
								<Sparkles
									size={16}
									className="text-violet-600"
								/>
								AI Summary
							</button>
						)}

						{showSummary && (
							<div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
								<p className="text-sm leading-relaxed text-slate-700">
									{summary}
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="space-y-2 border-y border-slate-100 py-4">
					<MetaRow label="Bug ID">
						<code className="text-slate-500">
							{shortId(bug._id)}
						</code>
					</MetaRow>
					<MetaRow label="Reported by">
						{bug.reportedBy?.name ?? "Unknown"}
						{bug.reportedBy?.role && (
							<span className="ml-1.5 text-slate-400">
								(
								{ROLE_LABELS[bug.reportedBy.role] ??
									bug.reportedBy.role}
								)
							</span>
						)}
					</MetaRow>
					<MetaRow label="Assigned to">
						{bug.assignedTo?.name ?? (
							<span className="text-slate-400">Nobody yet</span>
						)}
					</MetaRow>
					<MetaRow label="Created">
						{formatDateTime(bug.createdAt)}
					</MetaRow>
					{bug.updatedAt !== bug.createdAt && (
						<MetaRow label="Updated">
							{formatDateTime(bug.updatedAt)}
						</MetaRow>
					)}
				</div>

				{(statusOptions.length > 0 ||
					isProjectAdmin ||
					canEditPriority) && (
					<div className="grid gap-4 sm:grid-cols-2">
						{statusOptions.length > 0 && (
							<div>
								<label
									className={labelClass}
									htmlFor="bug-status"
								>
									Status
								</label>
								<select
									id="bug-status"
									value={bug.status}
									disabled={pendingField !== null}
									onChange={(event) =>
										applyUpdate(
											"status",
											{ status: event.target.value },
											`Status set to ${STATUS_LABELS[event.target.value]}`,
										)
									}
									className={controlClass}
								>
									{!statusOptions.includes(bug.status) && (
										<option value={bug.status} disabled>
											{STATUS_LABELS[bug.status] ??
												bug.status}{" "}
											(current)
										</option>
									)}
									{statusOptions.map((status) => (
										<option key={status} value={status}>
											{STATUS_LABELS[status]}
										</option>
									))}
								</select>
							</div>
						)}

						{canEditPriority && (
							<div>
								<label
									className={labelClass}
									htmlFor="bug-priority-edit"
								>
									Priority
								</label>
								<select
									id="bug-priority-edit"
									value={bug.priority}
									disabled={pendingField !== null}
									onChange={(event) =>
										applyUpdate(
											"priority",
											{ priority: event.target.value },
											`Priority set to ${event.target.value}`,
										)
									}
									className={controlClass}
								>
									{BUG_PRIORITIES.map((priority) => (
										<option key={priority} value={priority}>
											{priority}
										</option>
									))}
								</select>
							</div>
						)}

						{isProjectAdmin && (
							<div>
								<label
									className={labelClass}
									htmlFor="bug-assignee"
								>
									Assignee
								</label>
								<select
									id="bug-assignee"
									value={bug.assignedTo?._id ?? ""}
									disabled={pendingField !== null}
									onChange={(event) =>
										applyUpdate(
											"assignedTo",
											{
												assignedTo:
													event.target.value || null,
											},
											event.target.value
												? "Bug assigned"
												: "Bug unassigned",
										)
									}
									className={controlClass}
								>
									<option value="">Unassigned</option>
									{assignableMembers.map((member) => (
										<option
											key={member._id}
											value={member._id}
										>
											{member.name} (
											{ROLE_LABELS[member.role] ??
												member.role}
											)
										</option>
									))}
								</select>
								{assignableMembers.length === 0 && (
									<p className="mt-1.5 text-xs text-slate-400">
										No developers in this project yet.
									</p>
								)}
							</div>
						)}
					</div>
				)}

				<div>
					<span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
						<MessageSquare className="h-4 w-4 text-slate-500" />
						Discussion
						{comments.length > 0 && (
							<span className="text-slate-400">
								({comments.length})
							</span>
						)}
					</span>

					<div className="mt-3">
						<CommentThread
							comments={comments}
							isLoading={isLoadingComments}
							currentUserId={currentUser?._id}
						/>
					</div>

					<form
						onSubmit={handleAddComment}
						className="mt-4 flex gap-2"
					>
						<label className="sr-only" htmlFor="comment-text">
							Add a comment
						</label>
						<textarea
							id="comment-text"
							rows={2}
							value={commentText}
							onChange={(event) =>
								setCommentText(event.target.value)
							}
							disabled={isSendingComment}
							placeholder="Add a comment..."
							className={`${controlClass} resize-none`}
						/>
						<Button
							type="submit"
							isLoading={isSendingComment}
							disabled={!commentText.trim()}
							className="shrink-0 self-end"
							aria-label="Send comment"
						>
							<Send size={15} />
						</Button>
					</form>
				</div>

				<div className="flex justify-between gap-3 border-t border-slate-100 pt-4">
					{isProjectAdmin ? (
						<Button
							variant="danger"
							size="sm"
							onClick={handleDelete}
							isLoading={pendingField === "delete"}
							disabled={pendingField !== null}
						>
							<Trash2 size={14} />
							Delete Bug
						</Button>
					) : (
						<span />
					)}

					<Button variant="secondary" size="sm" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default BugDetailModal;
