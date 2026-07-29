import { ArrowLeft, Bug, Plus, Search, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";

import { createBug, fetchAllBugs } from "../api/bugsApi";
import {
	fetchProject,
	fetchProjectMembers,
	setProjectMemberRole,
} from "../api/projectApi";
import BugCard from "../components/BugCard";
import BugDetailModal from "../components/BugDetailModal";
import BugModal from "../components/BugModal";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import useAsyncData from "../hooks/useAsyncData";
import {
	BUG_PRIORITIES,
	BUG_STATUSES,
	ROLE_LABELS,
	ROLE_STYLES,
	STATUS_LABELS,
} from "../lib/constants";
import { cardClass, controlClass } from "../lib/styles";
import useAuthStore from "../stores/authStore";

const StatTile = ({ label, value, accent }) => (
	<div className={`${cardClass} px-4 py-3`}>
		<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
			{label}
		</p>
		<p className={`mt-1 text-xl font-bold ${accent}`}>{value}</p>
	</div>
);

const TeamPanel = ({ members, currentUser, canManageRoles, onRoleChange }) => (
	<section className={`${cardClass} p-5`}>
		<span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
			<Users className="h-4 w-4 text-red-500" />
			Project Team
			<span className="text-slate-400">({members.length})</span>
		</span>

		{members.length === 0 ? (
			<p className="mt-4 text-xs italic text-slate-400">
				No members assigned yet.
			</p>
		) : (
			<ul className="mt-4 space-y-2">
				{members.map((member) => {
					const isSelf = member._id === currentUser?._id;
					const canChange = canManageRoles && !isSelf && member.role !== "ProjectAdmin";

					return (
						<li
							key={member._id}
							className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
						>
							<span className="min-w-0">
								<span className="block truncate text-xs font-semibold text-slate-700">
									{member.name}
									{isSelf && <span className="ml-1 text-slate-400">(you)</span>}
								</span>
								<span className="block truncate text-[10px] text-slate-400">
									{member.email}
								</span>
							</span>

							{canChange ? (
								<select
									value={member.role}
									onChange={(event) =>
										onRoleChange(member._id, event.target.value)
									}
									aria-label={`Role for ${member.name}`}
									className={`${controlClass} w-auto px-2 py-1 text-xs`}
								>
									<option value="Developer">Developer</option>
									<option value="Tester">Tester</option>
								</select>
							) : (
								<Badge
									className={ROLE_STYLES[member.role] ?? ROLE_STYLES.Unassigned}
								>
									{ROLE_LABELS[member.role] ?? member.role}
								</Badge>
							)}
						</li>
					);
				})}
			</ul>
		)}
	</section>
);

const ProjectBugView = () => {
	const { projectId: projectIdParam } = useParams();
	const user = useAuthStore((state) => state.user);

	// Company admins open a specific project read-only; members see their own.
	const isAdminView = Boolean(projectIdParam);
	const projectId = projectIdParam ?? (user?.projectId ? String(user.projectId) : null);

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [priorityFilter, setPriorityFilter] = useState("All");

	const [isReportOpen, setIsReportOpen] = useState(false);
	const [selectedBugId, setSelectedBugId] = useState(null);

	const isProjectAdmin = !isAdminView && user?.role === "ProjectAdmin";
	const canReportBug = !isAdminView && user?.role === "Tester";

	const loader = useCallback(async () => {
		if (!projectId) return { project: null, bugs: [], members: [] };

		const [project, bugs] = await Promise.all([
			fetchProject(projectId),
			// Admins sit outside the project, so they must name it explicitly.
			fetchAllBugs(isAdminView ? { projectId } : {}),
		]);

		const members = isAdminView ? [] : await fetchProjectMembers();

		return { project, bugs, members };
	}, [projectId, isAdminView]);

	const { data, isLoading, setData, reload } = useAsyncData(loader);

	const project = data?.project ?? null;
	const members = data?.members ?? [];
	const bugs = useMemo(() => data?.bugs ?? [], [data]);

	const patchBugs = (updateBugList) => {
		setData((current) =>
			current ? { ...current, bugs: updateBugList(current.bugs) } : current,
		);
	};

	const stats = useMemo(() => {
		const counts = { Open: 0, InProgress: 0, Resolved: 0, Closed: 0 };
		for (const bug of bugs) {
			if (counts[bug.status] !== undefined) counts[bug.status] += 1;
		}
		return counts;
	}, [bugs]);

	const visibleBugs = useMemo(() => {
		const term = search.trim().toLowerCase();

		return bugs.filter((bug) => {
			if (statusFilter !== "All" && bug.status !== statusFilter) return false;
			if (priorityFilter !== "All" && bug.priority !== priorityFilter) {
				return false;
			}
			if (!term) return true;

			return (
				bug.title?.toLowerCase().includes(term) ||
				bug.description?.toLowerCase().includes(term) ||
				bug.assignedTo?.name?.toLowerCase().includes(term)
			);
		});
	}, [bugs, search, statusFilter, priorityFilter]);

	const selectedBug = bugs.find((bug) => bug._id === selectedBugId) ?? null;

	const handleReportBug = async (bugData) => {
		const created = await createBug({ ...bugData, projectId });
		patchBugs((current) => [created, ...current]);
	};

	const handleBugUpdated = (updatedBug) => {
		patchBugs((current) =>
			current.map((bug) => (bug._id === updatedBug._id ? updatedBug : bug)),
		);
	};

	const handleBugDeleted = (deletedId) => {
		patchBugs((current) => current.filter((bug) => bug._id !== deletedId));
		setSelectedBugId(null);
	};

	const handleRoleChange = async (memberId, role) => {
		try {
			const updated = await setProjectMemberRole(memberId, role);
			setData((current) =>
				current
					? {
							...current,
							members: current.members.map((member) =>
								member._id === memberId ? updated : member,
							),
						}
					: current,
			);
			toast.success(`Role updated to ${role}`);
		} catch (error) {
			toast.error(error.message);
			reload();
		}
	};

	if (isLoading) {
		return <PageLoader label="Loading project workspace..." />;
	}

	if (!project) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-16">
				<EmptyState
					icon={Bug}
					title="Project unavailable"
					description="We could not load this project. It may have been deleted."
					action={
						<Button as={Link} to="/company/projects">
							Back to projects
						</Button>
					}
				/>
			</div>
		);
	}

	const hasFilters =
		search.trim() !== "" || statusFilter !== "All" || priorityFilter !== "All";

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<header className="mb-6">
				{isAdminView && (
					<Link
						to="/company/projects"
						className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-red-600"
					>
						<ArrowLeft size={14} />
						Back to projects
					</Link>
				)}

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
							{project.name}
						</h1>
						<p className="mt-1 line-clamp-1 text-sm text-slate-500">
							{project.description ||
								(isAdminView
									? "Read-only view of this project's bugs."
									: "Track, assign and resolve bugs for this project.")}
						</p>
					</div>

					{canReportBug && (
						<Button
							onClick={() => setIsReportOpen(true)}
							className="group w-fit shrink-0"
						>
							<Plus
								size={17}
								className="transition-transform group-hover:rotate-90"
							/>
							Report Bug
						</Button>
					)}
				</div>
			</header>

			<div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
				<StatTile label="Open" value={stats.Open} accent="text-amber-600" />
				<StatTile
					label="In Progress"
					value={stats.InProgress}
					accent="text-blue-600"
				/>
				<StatTile
					label="Resolved"
					value={stats.Resolved}
					accent="text-emerald-600"
				/>
				<StatTile label="Closed" value={stats.Closed} accent="text-slate-600" />
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				<div className="space-y-5 lg:col-span-2">
					<div className="flex flex-col gap-3 sm:flex-row">
						<div className="relative flex-1">
							<Search
								size={15}
								className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								aria-hidden="true"
							/>
							<label className="sr-only" htmlFor="bug-search">
								Search bugs
							</label>
							<input
								id="bug-search"
								type="search"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search bugs by title, description or assignee"
								className={`${controlClass} pl-10`}
							/>
						</div>

						<label className="sr-only" htmlFor="status-filter">
							Filter by status
						</label>
						<select
							id="status-filter"
							value={statusFilter}
							onChange={(event) => setStatusFilter(event.target.value)}
							className={`${controlClass} sm:w-40`}
						>
							<option value="All">All statuses</option>
							{BUG_STATUSES.map((status) => (
								<option key={status} value={status}>
									{STATUS_LABELS[status]}
								</option>
							))}
						</select>

						<label className="sr-only" htmlFor="priority-filter">
							Filter by priority
						</label>
						<select
							id="priority-filter"
							value={priorityFilter}
							onChange={(event) => setPriorityFilter(event.target.value)}
							className={`${controlClass} sm:w-36`}
						>
							<option value="All">All priorities</option>
							{BUG_PRIORITIES.map((priority) => (
								<option key={priority} value={priority}>
									{priority}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-center justify-between border-b border-slate-200 pb-2">
						<h2 className="text-sm font-bold text-slate-700">Bugs</h2>
						<span className="text-xs text-slate-400">
							{visibleBugs.length} of {bugs.length}
						</span>
					</div>

					{visibleBugs.length === 0 ? (
						<EmptyState
							icon={Bug}
							title={hasFilters ? "No bugs match your filters" : "No bugs yet"}
							description={
								hasFilters
									? "Try a different search term or clear the filters."
									: canReportBug
										? "Clean slate. Report the first bug when you find one."
										: "Nothing has been reported for this project yet."
							}
							action={
								hasFilters ? (
									<Button
										variant="secondary"
										onClick={() => {
											setSearch("");
											setStatusFilter("All");
											setPriorityFilter("All");
										}}
									>
										Clear filters
									</Button>
								) : (
									canReportBug && (
										<Button onClick={() => setIsReportOpen(true)}>
											<Plus size={16} />
											Report a bug
										</Button>
									)
								)
							}
						/>
					) : (
						<div className="space-y-4">
							{visibleBugs.map((bug) => (
								<BugCard
									key={bug._id}
									bug={bug}
									onSelect={(selected) => setSelectedBugId(selected._id)}
								/>
							))}
						</div>
					)}
				</div>

				<aside className="space-y-6">
					{!isAdminView && (
						<TeamPanel
							members={members}
							currentUser={user}
							canManageRoles={isProjectAdmin}
							onRoleChange={handleRoleChange}
						/>
					)}

					{isProjectAdmin && (
						<section className={`${cardClass} p-5`}>
							<h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
								Join Requests
							</h2>
							<p className="mt-2 text-xs leading-relaxed text-slate-500">
								Review people asking to join this project and pick their role.
							</p>
							<Button
								as={Link}
								to="/company/project-requests"
								variant="secondary"
								size="sm"
								className="mt-4 w-full"
							>
								Open requests
							</Button>
						</section>
					)}

					{isAdminView && (
						<section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
							<p className="text-xs font-semibold text-blue-900">
								Read-only view
							</p>
							<p className="mt-1.5 text-xs leading-relaxed text-blue-700">
								As company admin you can review and comment on any project's
								bugs. Status changes and assignment stay with the project team.
							</p>
						</section>
					)}
				</aside>
			</div>

			{canReportBug && (
				<BugModal
					isOpen={isReportOpen}
					onClose={() => setIsReportOpen(false)}
					onSubmit={handleReportBug}
				/>
			)}

			{selectedBug && (
				<BugDetailModal
					bug={selectedBug}
					currentUser={user}
					members={members}
					onClose={() => setSelectedBugId(null)}
					onUpdated={handleBugUpdated}
					onDeleted={handleBugDeleted}
				/>
			)}
		</div>
	);
};

export default ProjectBugView;
