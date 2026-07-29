import {
	Building2,
	Bug,
	Check,
	Copy,
	FolderKanban,
	Plus,
	Trash2,
	UserPlus,
	Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import {
	fetchMyCompany,
	fetchUnassignedCompanyMembers,
} from "../api/companyApi";
import { requestToJoinProject } from "../api/notificationApi";
import {
	createProject,
	deleteProject,
	fetchAllProjects,
} from "../api/projectApi";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Field from "../components/ui/Field";
import Modal from "../components/ui/Modal";
import { PageLoader } from "../components/ui/Spinner";
import useAsyncData from "../hooks/useAsyncData";
import { ROLE_LABELS, ROLE_STYLES } from "../lib/constants";
import { cardClass, controlClass } from "../lib/styles";
import useAuthStore from "../stores/authStore";

const InviteCodeCard = ({ company }) => {
	const [isCopied, setIsCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(company.inviteCode);
			setIsCopied(true);
			toast.success("Invite code copied");
			setTimeout(() => setIsCopied(false), 2000);
		} catch {
			toast.error("Could not copy. Select the code and copy it manually.");
		}
	};

	return (
		<div className="mt-5 rounded-xl border border-red-100 bg-red-50/60 p-4">
			<p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
				Invite Code
			</p>
			<p className="mt-1 text-[11px] text-slate-500">
				Share this with teammates so they can request access.
			</p>
			<div className="mt-3 flex items-center gap-2">
				<code className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold tracking-[0.25em] text-slate-900">
					{company.inviteCode}
				</code>
				<Button
					variant="secondary"
					size="sm"
					onClick={copy}
					aria-label="Copy invite code"
					className="shrink-0"
				>
					{isCopied ? <Check size={14} /> : <Copy size={14} />}
				</Button>
			</div>
		</div>
	);
};

const ProjectCard = ({
	project,
	user,
	isCompanyAdmin,
	onRequestJoin,
	onDelete,
	pendingJoinId,
	deletingId,
}) => {
	const isMyProject =
		user?.projectId && project._id === String(user.projectId);
	const canRequestJoin = !isCompanyAdmin && !user?.projectId;

	const bugsPath = isCompanyAdmin
		? `/company/projects/${project._id}/bugs`
		: "/company/my-project";

	return (
		<article className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-red-300 hover:shadow-md">
			<div>
				<div className="flex items-start justify-between gap-3">
					<h2 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover:text-red-600">
						{project.name}
					</h2>
					{isMyProject ? (
						<Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
							Yours
						</Badge>
					) : (
						<Badge className="border-red-100 bg-red-50 text-red-700">
							Active
						</Badge>
					)}
				</div>

				<p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
					{project.description || "No description provided for this project."}
				</p>

				<dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
					<div className="flex items-center gap-1.5">
						<Users size={13} className="text-slate-400" />
						<dt className="sr-only">Members</dt>
						<dd>
							{project.memberCount ?? 0}{" "}
							{project.memberCount === 1 ? "member" : "members"}
						</dd>
					</div>
					<div className="flex items-center gap-1.5">
						<Bug size={13} className="text-slate-400" />
						<dt className="sr-only">Bugs</dt>
						<dd>
							{project.bugCount ?? 0} {project.bugCount === 1 ? "bug" : "bugs"}
						</dd>
					</div>
					{project.adminId?.name && (
						<div className="flex items-center gap-1.5">
							<dt className="sr-only">Project admin</dt>
							<dd className="truncate">Lead: {project.adminId.name}</dd>
						</div>
					)}
				</dl>
			</div>

			<div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
				{canRequestJoin && (
					<Button
						variant="secondary"
						size="xs"
						onClick={() => onRequestJoin(project._id)}
						isLoading={pendingJoinId === project._id}
					>
						<UserPlus size={13} />
						Request to Join
					</Button>
				)}

				{(isCompanyAdmin || isMyProject) && (
					<Button as={Link} to={bugsPath} variant="secondary" size="xs">
						<Bug size={13} />
						View Bugs
					</Button>
				)}

				{isCompanyAdmin && (
					<Button
						variant="danger"
						size="xs"
						onClick={() => onDelete(project)}
						isLoading={deletingId === project._id}
						aria-label={`Delete ${project.name}`}
					>
						<Trash2 size={14} />
					</Button>
				)}
			</div>
		</article>
	);
};

const ProjectsView = () => {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();
	const isCompanyAdmin = user?.role === "Admin";

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newProject, setNewProject] = useState({
		name: "",
		description: "",
		adminId: "",
	});

	const [pendingJoinId, setPendingJoinId] = useState(null);
	const [deletingId, setDeletingId] = useState(null);

	const loader = useCallback(async () => {
		const [projects, companyInfo] = await Promise.all([
			fetchAllProjects(),
			fetchMyCompany(),
		]);

		// Only the company admin can list unassigned members, and a failure here
		// should not blank the whole page.
		const assignableMembers = isCompanyAdmin
			? await fetchUnassignedCompanyMembers().catch(() => [])
			: [];

		return { projects, companyInfo, assignableMembers };
	}, [isCompanyAdmin]);

	const { data, isLoading, reload } = useAsyncData(loader);

	const projects = data?.projects ?? [];
	const companyInfo = data?.companyInfo ?? null;
	const assignableMembers = data?.assignableMembers ?? [];

	const handleCreate = async (event) => {
		event.preventDefault();

		if (!newProject.adminId) {
			toast.error("Please assign a project admin");
			return;
		}

		setIsCreating(true);
		try {
			await createProject(newProject);
			toast.success("Project created successfully");
			setNewProject({ name: "", description: "", adminId: "" });
			setIsModalOpen(false);
			await reload();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsCreating(false);
		}
	};

	const handleDelete = async (project) => {
		const confirmed = window.confirm(
			`Delete "${project.name}"? Its bugs are removed and members are unassigned.`,
		);
		if (!confirmed) return;

		setDeletingId(project._id);
		try {
			await deleteProject(project._id);
			toast.success("Project deleted");
			await reload();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setDeletingId(null);
		}
	};

	const handleRequestJoin = async (projectId) => {
		setPendingJoinId(projectId);
		try {
			await requestToJoinProject(projectId);
			toast.success("Join request sent to the project admin");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setPendingJoinId(null);
		}
	};

	if (isLoading) {
		return <PageLoader label="Loading projects..." />;
	}

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
						Projects
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						{isCompanyAdmin
							? "Create projects and assign a lead for each one."
							: "Browse your company's projects and request access."}
					</p>
				</div>

				{isCompanyAdmin && (
					<Button onClick={() => setIsModalOpen(true)} className="group w-fit">
						<Plus
							size={17}
							className="transition-transform group-hover:rotate-90"
						/>
						New Project
					</Button>
				)}
			</header>

			<div className="grid gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2">
					{projects.length === 0 ? (
						<EmptyState
							icon={FolderKanban}
							title="No projects yet"
							description={
								isCompanyAdmin
									? "Create your first project to start tracking bugs with your team."
									: "Your company admin has not created any projects yet."
							}
							action={
								isCompanyAdmin && (
									<Button onClick={() => setIsModalOpen(true)}>
										<Plus size={16} />
										Create your first project
									</Button>
								)
							}
						/>
					) : (
						<div className="grid gap-5 sm:grid-cols-2">
							{projects.map((project) => (
								<ProjectCard
									key={project._id}
									project={project}
									user={user}
									isCompanyAdmin={isCompanyAdmin}
									onRequestJoin={handleRequestJoin}
									onDelete={handleDelete}
									pendingJoinId={pendingJoinId}
									deletingId={deletingId}
								/>
							))}
						</div>
					)}
				</div>

				<aside className="space-y-6">
					{companyInfo && (
						<section className={`${cardClass} p-6`}>
							<span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
								<Building2 className="h-4 w-4 text-red-500" />
								Workspace
							</span>

							<h2 className="mt-4 text-lg font-bold text-slate-900">
								{companyInfo.company.name}
							</h2>
							<p className="mt-0.5 truncate text-xs text-slate-500">
								{companyInfo.company.email}
							</p>
							<p className="mt-3 text-xs text-slate-500">
								{companyInfo.memberCount}{" "}
								{companyInfo.memberCount === 1 ? "member" : "members"} ·{" "}
								{projects.length} {projects.length === 1 ? "project" : "projects"}
							</p>

							{companyInfo.company.inviteCode && (
								<InviteCodeCard company={companyInfo.company} />
							)}
						</section>
					)}

					{companyInfo?.members?.length > 0 && (
						<section className={`${cardClass} p-6`}>
							<span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
								<Users className="h-4 w-4 text-red-500" />
								Team
							</span>

							<ul className="scrollbar-slim mt-4 max-h-80 space-y-2 overflow-y-auto">
								{companyInfo.members.map((member) => (
									<li
										key={member._id}
										className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
									>
										<span className="min-w-0">
											<span className="block truncate text-xs font-semibold text-slate-700">
												{member.name}
												{member._id === user?._id && (
													<span className="ml-1 text-slate-400">(you)</span>
												)}
											</span>
											<span className="block truncate text-[10px] text-slate-400">
												{member.email}
											</span>
										</span>
										<Badge
											className={
												ROLE_STYLES[member.role] ?? ROLE_STYLES.Unassigned
											}
										>
											{ROLE_LABELS[member.role] ?? member.role}
										</Badge>
									</li>
								))}
							</ul>
						</section>
					)}

					{!isCompanyAdmin && !user?.projectId && (
						<section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
							<p className="text-xs font-semibold text-amber-900">
								You are not in a project yet
							</p>
							<p className="mt-1.5 text-xs leading-relaxed text-amber-700">
								Request access to a project above. Once the project admin
								approves and assigns your role, your workspace unlocks.
							</p>
						</section>
					)}

					{user?.projectId && !isCompanyAdmin && (
						<Button
							onClick={() => navigate("/company/my-project")}
							className="w-full"
						>
							<Bug size={16} />
							Go to my workspace
						</Button>
					)}
				</aside>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Create New Project"
				icon={Plus}
			>
				<form onSubmit={handleCreate} className="space-y-4">
					<Field label="Project Name" htmlFor="project-name">
						<input
							id="project-name"
							type="text"
							value={newProject.name}
							onChange={(event) =>
								setNewProject((current) => ({
									...current,
									name: event.target.value,
								}))
							}
							required
							disabled={isCreating}
							placeholder="ResolverHub Frontend"
							className={controlClass}
						/>
					</Field>

					<Field label="Description" htmlFor="project-description">
						<textarea
							id="project-description"
							rows={3}
							value={newProject.description}
							onChange={(event) =>
								setNewProject((current) => ({
									...current,
									description: event.target.value,
								}))
							}
							disabled={isCreating}
							placeholder="What is this project about?"
							className={`${controlClass} resize-none`}
						/>
					</Field>

					<Field
						label="Project Admin"
						htmlFor="project-admin"
						hint={
							assignableMembers.length === 0
								? "No unassigned members available. Invite teammates with your invite code first."
								: "They will lead the project and review join requests."
						}
					>
						<select
							id="project-admin"
							value={newProject.adminId}
							onChange={(event) =>
								setNewProject((current) => ({
									...current,
									adminId: event.target.value,
								}))
							}
							required
							disabled={isCreating || assignableMembers.length === 0}
							className={controlClass}
						>
							<option value="">Select an unassigned member...</option>
							{assignableMembers.map((member) => (
								<option key={member._id} value={member._id}>
									{member.name} ({member.email})
								</option>
							))}
						</select>
					</Field>

					<div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsModalOpen(false)}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							isLoading={isCreating}
							disabled={assignableMembers.length === 0}
						>
							{isCreating ? "Creating..." : "Create Project"}
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
};

export default ProjectsView;
