export const ROLES = {
	ADMIN: "Admin",
	PROJECT_ADMIN: "ProjectAdmin",
	DEVELOPER: "Developer",
	TESTER: "Tester",
	UNASSIGNED: "Unassigned",
};

export const ROLE_LABELS = {
	Admin: "Company Admin",
	ProjectAdmin: "Project Admin",
	Developer: "Developer",
	Tester: "Tester",
	Unassigned: "Unassigned",
};

export const ROLE_STYLES = {
	Admin: "bg-violet-50 text-violet-700 border-violet-200",
	ProjectAdmin: "bg-indigo-50 text-indigo-700 border-indigo-200",
	Developer: "bg-emerald-50 text-emerald-700 border-emerald-200",
	Tester: "bg-amber-50 text-amber-700 border-amber-200",
	Unassigned: "bg-slate-50 text-slate-600 border-slate-200",
};

export const BUG_STATUSES = ["Open", "InProgress", "Resolved", "Closed"];

export const STATUS_LABELS = {
	Open: "Open",
	InProgress: "In Progress",
	Resolved: "Resolved",
	Closed: "Closed",
};

export const STATUS_STYLES = {
	Open: "bg-amber-50 text-amber-700 border-amber-200",
	InProgress: "bg-blue-50 text-blue-700 border-blue-200",
	Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
	Closed: "bg-slate-100 text-slate-600 border-slate-200",
};

export const BUG_PRIORITIES = ["Low", "Medium", "High", "Critical"];

export const PRIORITY_STYLES = {
	Low: "bg-slate-50 text-slate-600 border-slate-200",
	Medium: "bg-blue-50 text-blue-700 border-blue-200",
	High: "bg-orange-50 text-orange-700 border-orange-200",
	Critical: "bg-red-50 text-red-700 border-red-200",
};

/** Status transitions each role is allowed to perform, mirroring the API rules. */
export const ALLOWED_STATUS_BY_ROLE = {
	ProjectAdmin: BUG_STATUSES,
	Developer: ["InProgress", "Resolved"],
	Tester: ["Open", "Closed"],
	Admin: [],
	Unassigned: [],
};
