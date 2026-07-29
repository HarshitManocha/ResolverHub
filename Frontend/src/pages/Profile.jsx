import {
	Building2,
	Eye,
	EyeOff,
	FolderKanban,
	KeyRound,
	Mail,
	Pencil,
	Save,
	Shield,
	User,
	X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { changeMyPassword, updateMyProfile } from "../api/profileApi";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { ROLE_LABELS, ROLE_STYLES } from "../lib/constants";
import { cardClass, controlClass } from "../lib/styles";
import useAuthStore from "../stores/authStore";

const InfoRow = ({ icon: Icon, label, children }) => (
	<div className="flex items-center gap-3 text-sm">
		<Icon className="h-4 w-4 shrink-0 text-red-400" />
		<span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500">
			{label}
		</span>
		<span className="min-w-0 flex-1 truncate font-medium text-slate-800">
			{children}
		</span>
	</div>
);

const Profile = () => {
	const user = useAuthStore((state) => state.user);
	const patchUser = useAuthStore((state) => state.patchUser);

	const [isEditing, setIsEditing] = useState(false);
	const [nameDraft, setNameDraft] = useState(user?.name ?? "");
	const [isSavingName, setIsSavingName] = useState(false);

	const [passwordForm, setPasswordForm] = useState({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [visible, setVisible] = useState({
		old: false,
		next: false,
		confirm: false,
	});
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const passwordsMismatch =
		passwordForm.confirmPassword.length > 0 &&
		passwordForm.newPassword !== passwordForm.confirmPassword;

	const roleStyle = ROLE_STYLES[user?.role] ?? ROLE_STYLES.Unassigned;

	const handleSaveName = async (event) => {
		event.preventDefault();
		const name = nameDraft.trim();

		if (!name) {
			toast.error("Name cannot be empty");
			return;
		}

		if (name === user.name) {
			setIsEditing(false);
			return;
		}

		setIsSavingName(true);
		try {
			const updated = await updateMyProfile({ name });
			patchUser({ name: updated.name });
			setIsEditing(false);
			toast.success("Name updated successfully");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsSavingName(false);
		}
	};

	const handleChangePassword = async (event) => {
		event.preventDefault();

		if (passwordsMismatch) {
			toast.error("New passwords do not match");
			return;
		}

		setIsSavingPassword(true);
		try {
			await changeMyPassword({
				oldPassword: passwordForm.oldPassword,
				newPassword: passwordForm.newPassword,
			});
			setPasswordForm({
				oldPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			toast.success("Password changed successfully");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsSavingPassword(false);
		}
	};

	const updatePasswordField = (event) => {
		setPasswordForm((current) => ({
			...current,
			[event.target.name]: event.target.value,
		}));
	};

	return (
		<div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
			<header className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					My Profile
				</h1>
				<p className="mt-1 text-sm text-slate-500">
					Manage your account details and password.
				</p>
			</header>

			<section className={`${cardClass} mb-6 p-6 sm:p-8`}>
				<div className="mb-6 flex items-center justify-between">
					<span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
						<User className="h-4 w-4 text-red-500" />
						Profile Details
					</span>
					{!isEditing && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setNameDraft(user?.name ?? "");
								setIsEditing(true);
							}}
							className="text-red-600 hover:bg-red-50"
						>
							<Pencil className="h-3.5 w-3.5" />
							Edit
						</Button>
					)}
				</div>

				<div className="mb-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
					<Avatar name={user?.name} size="lg" />

					{isEditing ? (
						<form onSubmit={handleSaveName} className="w-full flex-1 space-y-4">
							<Field label="Full Name" htmlFor="profile-name">
								<input
									id="profile-name"
									type="text"
									value={nameDraft}
									onChange={(event) => setNameDraft(event.target.value)}
									required
									disabled={isSavingName}
									className={controlClass}
								/>
							</Field>
							<div className="flex gap-2">
								<Button type="submit" size="sm" isLoading={isSavingName}>
									<Save className="h-3.5 w-3.5" />
									{isSavingName ? "Saving..." : "Save"}
								</Button>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									disabled={isSavingName}
									onClick={() => {
										setNameDraft(user?.name ?? "");
										setIsEditing(false);
									}}
								>
									<X className="h-3.5 w-3.5" />
									Cancel
								</Button>
							</div>
						</form>
					) : (
						<div className="text-center sm:text-left">
							<h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
							<p className="mt-0.5 text-sm text-slate-500">{user?.email}</p>
							<Badge className={`mt-2 ${roleStyle}`}>
								{ROLE_LABELS[user?.role] ?? user?.role}
							</Badge>
						</div>
					)}
				</div>

				{!isEditing && (
					<div className="space-y-3 border-t border-slate-100 pt-5">
						<InfoRow icon={Mail} label="Email">
							{user?.email}
						</InfoRow>
						<InfoRow icon={Shield} label="Role">
							<Badge className={roleStyle}>
								{ROLE_LABELS[user?.role] ?? user?.role}
							</Badge>
						</InfoRow>
						<InfoRow icon={Building2} label="Company">
							{user?.companyId ? (
								"Active member"
							) : (
								<span className="text-slate-400">Not in a company yet</span>
							)}
						</InfoRow>
						<InfoRow icon={FolderKanban} label="Project">
							{user?.projectId ? (
								"Assigned"
							) : (
								<span className="text-slate-400">Not assigned</span>
							)}
						</InfoRow>
					</div>
				)}
			</section>

			<section className={`${cardClass} p-6 sm:p-8`}>
				<span className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
					<KeyRound className="h-4 w-4 text-red-500" />
					Change Password
				</span>

				<form onSubmit={handleChangePassword} className="space-y-4">
					<Field label="Current Password" htmlFor="old-password">
						<div className="relative">
							<input
								id="old-password"
								name="oldPassword"
								type={visible.old ? "text" : "password"}
								autoComplete="current-password"
								value={passwordForm.oldPassword}
								onChange={updatePasswordField}
								required
								disabled={isSavingPassword}
								placeholder="••••••••"
								className={`${controlClass} pr-11`}
							/>
							<button
								type="button"
								onClick={() =>
									setVisible((current) => ({ ...current, old: !current.old }))
								}
								aria-label="Toggle current password visibility"
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 transition hover:text-red-600"
							>
								{visible.old ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</Field>

					<Field
						label="New Password"
						htmlFor="new-password"
						hint="At least 6 characters."
					>
						<div className="relative">
							<input
								id="new-password"
								name="newPassword"
								type={visible.next ? "text" : "password"}
								autoComplete="new-password"
								value={passwordForm.newPassword}
								onChange={updatePasswordField}
								required
								minLength={6}
								disabled={isSavingPassword}
								placeholder="••••••••"
								className={`${controlClass} pr-11`}
							/>
							<button
								type="button"
								onClick={() =>
									setVisible((current) => ({ ...current, next: !current.next }))
								}
								aria-label="Toggle new password visibility"
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 transition hover:text-red-600"
							>
								{visible.next ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</Field>

					<Field
						label="Confirm New Password"
						htmlFor="confirm-password"
						error={passwordsMismatch ? "Passwords do not match." : undefined}
					>
						<div className="relative">
							<input
								id="confirm-password"
								name="confirmPassword"
								type={visible.confirm ? "text" : "password"}
								autoComplete="new-password"
								value={passwordForm.confirmPassword}
								onChange={updatePasswordField}
								required
								minLength={6}
								disabled={isSavingPassword}
								placeholder="Re-enter new password"
								className={`${controlClass} pr-11`}
							/>
							<button
								type="button"
								onClick={() =>
									setVisible((current) => ({
										...current,
										confirm: !current.confirm,
									}))
								}
								aria-label="Toggle confirm password visibility"
								className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 transition hover:text-red-600"
							>
								{visible.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</Field>

					<Button
						type="submit"
						size="lg"
						className="w-full"
						isLoading={isSavingPassword}
						disabled={passwordsMismatch}
					>
						<KeyRound className="h-4 w-4" />
						{isSavingPassword ? "Changing..." : "Change Password"}
					</Button>
				</form>
			</section>
		</div>
	);
};

export default Profile;
