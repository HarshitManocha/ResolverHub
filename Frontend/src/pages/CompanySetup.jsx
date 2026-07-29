import { Building2, KeyRound, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { createCompany } from "../api/companyApi";
import { requestToJoinCompany } from "../api/notificationApi";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { refreshSession } from "../lib/session";
import { cardClass, controlClass } from "../lib/styles";
import useAuthStore from "../stores/authStore";

const INVITE_CODE_PATTERN = /^[0-9A-F]{8}$/;

const CompanySetup = () => {
	const user = useAuthStore((state) => state.user);
	const navigate = useNavigate();

	const [createForm, setCreateForm] = useState({ name: "", email: "" });
	const [inviteCode, setInviteCode] = useState("");
	const [pendingAction, setPendingAction] = useState(null);

	const isBusy = pendingAction !== null;

	const handleCreateChange = (event) => {
		setCreateForm((current) => ({
			...current,
			[event.target.name]: event.target.value,
		}));
	};

	const handleCreate = async (event) => {
		event.preventDefault();
		if (isBusy) return;

		setPendingAction("create");
		try {
			await createCompany(createForm);
			// The user is now an Admin with a companyId, so the store must catch up
			// before the route guards run.
			await refreshSession();

			toast.success("Workspace created! You are the company admin.");
			navigate("/company/projects", { replace: true });
		} catch (error) {
			toast.error(error.message);
		} finally {
			setPendingAction(null);
		}
	};

	const handleJoin = async (event) => {
		event.preventDefault();
		if (isBusy) return;

		const code = inviteCode.trim().toUpperCase();

		if (!INVITE_CODE_PATTERN.test(code)) {
			toast.error("Invite code must be 8 hexadecimal characters, e.g. 3F9A2B01");
			return;
		}

		setPendingAction("join");
		try {
			await requestToJoinCompany(code);
			toast.success(
				"Request sent. You will join the workspace once an admin approves it.",
			);
			setInviteCode("");
			navigate("/", { replace: true });
		} catch (error) {
			toast.error(error.message);
		} finally {
			setPendingAction(null);
		}
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
			<header className="mb-10 text-center">
				<h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					Hi {user?.name?.split(" ")[0] ?? "there"}, set up your workspace
				</h1>
				<p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
					Create a company if you are starting fresh, or join an existing one
					with an invite code from your admin.
				</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
				<form onSubmit={handleCreate} className={`${cardClass} p-7`}>
					<div className="mb-7 text-center">
						<div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-orange-500 text-white shadow-md shadow-red-200">
							<Building2 size={20} />
						</div>
						<h2 className="text-lg font-bold tracking-tight text-slate-900">
							Create a workspace
						</h2>
						<p className="mt-1.5 text-sm text-slate-500">
							You become the company admin and get an invite code to share.
						</p>
					</div>

					<div className="space-y-5">
						<Field label="Company Name" htmlFor="company-name">
							<input
								id="company-name"
								name="name"
								type="text"
								value={createForm.name}
								onChange={handleCreateChange}
								required
								disabled={isBusy}
								placeholder="ResolverHub Inc."
								className={controlClass}
							/>
						</Field>

						<Field label="Company Email" htmlFor="company-email">
							<input
								id="company-email"
								name="email"
								type="email"
								value={createForm.email}
								onChange={handleCreateChange}
								required
								disabled={isBusy}
								placeholder="team@company.com"
								className={controlClass}
							/>
						</Field>

						<Button
							type="submit"
							size="lg"
							className="w-full"
							isLoading={pendingAction === "create"}
							disabled={isBusy}
						>
							<Plus size={16} />
							{pendingAction === "create" ? "Creating..." : "Create Company"}
						</Button>
					</div>
				</form>

				<div
					className="flex items-center justify-center gap-4 lg:flex-col"
					aria-hidden="true"
				>
					<span className="h-px w-16 bg-slate-200 lg:h-full lg:w-px" />
					<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
						or
					</span>
					<span className="h-px w-16 bg-slate-200 lg:h-full lg:w-px" />
				</div>

				<form onSubmit={handleJoin} className={`${cardClass} p-7`}>
					<div className="mb-7 text-center">
						<div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
							<KeyRound size={20} />
						</div>
						<h2 className="text-lg font-bold tracking-tight text-slate-900">
							Join a workspace
						</h2>
						<p className="mt-1.5 text-sm text-slate-500">
							Your admin will review and approve the request.
						</p>
					</div>

					<div className="space-y-5">
						<Field
							label="Invite Code"
							htmlFor="invite-code"
							hint="8 hexadecimal characters, for example 3F9A2B01."
						>
							<input
								id="invite-code"
								name="inviteCode"
								type="text"
								value={inviteCode}
								onChange={(event) =>
									setInviteCode(event.target.value.toUpperCase())
								}
								required
								disabled={isBusy}
								maxLength={8}
								placeholder="3F9A2B01"
								className={`${controlClass} font-mono tracking-[0.3em] uppercase`}
							/>
						</Field>

						<Button
							type="submit"
							size="lg"
							variant="secondary"
							className="w-full"
							isLoading={pendingAction === "join"}
							disabled={isBusy}
						>
							{pendingAction === "join" ? "Sending..." : "Request to Join"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CompanySetup;
