import { AlertCircle, CheckCircle2, Clock, UserRound } from "lucide-react";

import {
	PRIORITY_STYLES,
	STATUS_LABELS,
	STATUS_STYLES,
} from "../lib/constants";
import { formatRelativeTime, shortId } from "../lib/format";
import Badge from "./ui/Badge";

const STATUS_ICONS = {
	Open: Clock,
	InProgress: AlertCircle,
	Resolved: CheckCircle2,
	Closed: CheckCircle2,
};

const BugCard = ({ bug, onSelect }) => {
	const StatusIcon = STATUS_ICONS[bug.status] ?? Clock;

	return (
		<button
			type="button"
			onClick={() => onSelect(bug)}
			className="group w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-red-300 hover:shadow-md"
		>
			<div className="flex items-start justify-between gap-3">
				<h3 className="line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-red-600">
					{bug.title}
				</h3>
				<Badge
					className={PRIORITY_STYLES[bug.priority] ?? PRIORITY_STYLES.Medium}
				>
					{bug.priority}
				</Badge>
			</div>

			<p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
				{bug.description || "No description provided for this bug."}
			</p>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
					<span className="font-semibold text-slate-500">
						{shortId(bug._id)}
					</span>
					<span className="flex items-center gap-1">
						<UserRound size={11} />
						{bug.assignedTo?.name ?? "Unassigned"}
					</span>
					<span>{formatRelativeTime(bug.createdAt)}</span>
				</div>

				<Badge className={STATUS_STYLES[bug.status] ?? STATUS_STYLES.Open}>
					<StatusIcon size={11} />
					{STATUS_LABELS[bug.status] ?? bug.status}
				</Badge>
			</div>
		</button>
	);
};

export default BugCard;
