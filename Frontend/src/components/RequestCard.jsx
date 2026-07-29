import { Check, Clock, X } from "lucide-react";
import { useState } from "react";

import { formatDateTime } from "../lib/format";
import { controlClass } from "../lib/styles";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const PROJECT_ROLES = ["Developer", "Tester"];

const RequestCard = ({ request, context, onAccept, onDeny }) => {
	const needsRole = context === "project";
	const [role, setRole] = useState("Developer");
	const [action, setAction] = useState(null);

	const sender = request.senderId ?? {};

	const handleAccept = async () => {
		setAction("accept");
		try {
			await onAccept(request._id, needsRole ? role : undefined);
		} finally {
			setAction(null);
		}
	};

	const handleDeny = async () => {
		setAction("deny");
		try {
			await onDeny(request._id);
		} finally {
			setAction(null);
		}
	};

	return (
		<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div className="flex min-w-0 items-center gap-4">
					<Avatar name={sender.name} />
					<div className="min-w-0">
						<h2 className="truncate text-base font-bold text-slate-900">
							{sender.name ?? "Unknown user"}
						</h2>
						<p className="truncate text-sm text-slate-500">
							{sender.email ?? "No email provided"}
						</p>
					</div>
				</div>

				<Badge className="border-amber-200 bg-amber-50 text-amber-700">
					<Clock size={11} />
					Pending
				</Badge>
			</div>

			<div className="mt-5 rounded-xl bg-slate-50 p-4">
				<p className="text-sm font-medium text-slate-700">
					{request.message ??
						`Wants to join your ${needsRole ? "project" : "company"}`}
				</p>
				<p className="mt-2 text-xs text-slate-400">
					Requested on {formatDateTime(request.createdAt)}
				</p>
			</div>

			<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
				{needsRole && (
					<label className="flex items-center gap-2 sm:mr-auto">
						<span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
							Role
						</span>
						<select
							value={role}
							onChange={(event) => setRole(event.target.value)}
							disabled={action !== null}
							className={`${controlClass} w-auto py-2`}
						>
							{PROJECT_ROLES.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
				)}

				<Button
					variant="danger"
					size="sm"
					onClick={handleDeny}
					isLoading={action === "deny"}
					disabled={action !== null}
				>
					<X size={14} />
					Reject
				</Button>

				<Button
					variant="success"
					size="sm"
					onClick={handleAccept}
					isLoading={action === "accept"}
					disabled={action !== null}
				>
					<Check size={14} />
					Accept
				</Button>
			</div>
		</article>
	);
};

export default RequestCard;
