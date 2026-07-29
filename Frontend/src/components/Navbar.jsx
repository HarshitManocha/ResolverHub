import {
	Bell,
	Briefcase,
	CheckCheck,
	ChevronRight,
	Inbox,
	LayoutGrid,
	LogOut,
	Menu,
	User,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import useNotifications from "../hooks/useNotifications";
import { ROLE_LABELS, ROLE_STYLES } from "../lib/constants";
import { formatRelativeTime } from "../lib/format";
import useAuthStore from "../stores/authStore";
import Avatar from "./ui/Avatar";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const buildNavLinks = (user) => {
	if (!user) return [];

	if (!user.companyId) {
		return [{ to: "/company/setup", label: "Get Started", icon: Zap }];
	}

	const links = [];

	if (user.role === "Admin") {
		links.push({ to: "/company/projects", label: "Projects", icon: LayoutGrid });
		links.push({ to: "/company/requests", label: "Requests", icon: Inbox });
		return links;
	}

	if (user.projectId) {
		links.push({
			to: "/company/my-project",
			label: "Workspace",
			icon: Briefcase,
		});
	}

	links.push({ to: "/company/projects", label: "Projects", icon: LayoutGrid });

	if (user.role === "ProjectAdmin") {
		links.push({
			to: "/company/project-requests",
			label: "Requests",
			icon: Inbox,
		});
	}

	return links;
};

const requestsPathFor = (user) => {
	if (user?.role === "Admin") return "/company/requests";
	if (user?.role === "ProjectAdmin") return "/company/project-requests";
	return null;
};

const NotificationList = ({ notifications, reviewPath, onNavigate }) => {
	if (notifications.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center px-6 py-10 text-center">
				<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
					<Bell size={22} />
				</div>
				<p className="text-sm font-semibold text-slate-900">All caught up</p>
				<p className="mt-1 text-xs text-slate-500">
					New activity will show up here.
				</p>
			</div>
		);
	}

	return (
		<ul className="divide-y divide-slate-100">
			{notifications.map((notification) => {
				const isActionable =
					notification.actionStatus === "Pending" && Boolean(reviewPath);

				const content = (
					<>
						<span
							className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
								notification.isRead ? "bg-transparent" : "bg-red-500"
							}`}
							aria-hidden="true"
						/>
						<span className="flex-1">
							<span className="block text-xs leading-relaxed text-slate-700">
								{notification.message}
							</span>
							<span className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
								{formatRelativeTime(notification.createdAt)}
								{notification.actionStatus !== "NA" && (
									<span
										className={
											notification.actionStatus === "Pending"
												? "text-amber-600"
												: notification.actionStatus === "Approved"
													? "text-emerald-600"
													: "text-slate-400"
										}
									>
										{notification.actionStatus}
									</span>
								)}
							</span>
						</span>
						{isActionable && (
							<ChevronRight size={14} className="mt-1 shrink-0 text-slate-300" />
						)}
					</>
				);

				return (
					<li key={notification._id}>
						{isActionable ? (
							<Link
								to={reviewPath}
								onClick={onNavigate}
								className="flex gap-3 px-4 py-3 transition-colors hover:bg-red-50/60"
							>
								{content}
							</Link>
						) : (
							<div className="flex gap-3 px-4 py-3">{content}</div>
						)}
					</li>
				);
			})}
		</ul>
	);
};

const Navbar = () => {
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);

	const [isBellOpen, setIsBellOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const bellRef = useRef(null);
	const navigate = useNavigate();

	const { notifications, unreadCount, markAllRead } = useNotifications();

	const navLinks = buildNavLinks(user);
	const reviewPath = requestsPathFor(user);

	useEffect(() => {
		if (!isBellOpen) return undefined;

		const onPointerDown = (event) => {
			if (bellRef.current && !bellRef.current.contains(event.target)) {
				setIsBellOpen(false);
			}
		};

		document.addEventListener("mousedown", onPointerDown);
		return () => document.removeEventListener("mousedown", onPointerDown);
	}, [isBellOpen]);

	const closeMobileMenu = () => setIsMobileMenuOpen(false);

	const handleLogout = () => {
		setIsBellOpen(false);
		setIsMobileMenuOpen(false);
		logout();
		navigate("/login", { replace: true });
	};

	const navLinkClass = ({ isActive }) =>
		[
			"flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
			isActive
				? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
				: "text-slate-600 hover:bg-slate-50 hover:text-red-700",
		].join(" ");

	return (
		<nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<Link
						to="/"
						className="group flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 transition-colors hover:text-red-600"
					>
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-orange-500 text-white shadow-md shadow-red-200 transition-transform group-hover:scale-105">
							<Zap size={17} fill="currentColor" />
						</span>
						Resolver<span className="-ml-2 text-red-600">Hub</span>
					</Link>

					{user ? (
						<div className="hidden items-center gap-3 md:flex">
							{navLinks.map(({ to, label, icon: Icon }) => (
								<NavLink key={to} to={to} className={navLinkClass} end>
									<Icon size={15} />
									{label}
								</NavLink>
							))}

							<span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />

							<div className="relative flex items-center" ref={bellRef}>
								<button
									type="button"
									onClick={() => {
										const next = !isBellOpen;
										setIsBellOpen(next);
										if (next) markAllRead();
									}}
									aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
									aria-expanded={isBellOpen}
									className="relative rounded-full p-2 text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
								>
									<Bell size={19} />
									{unreadCount > 0 && (
										<span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
											{unreadCount > 9 ? "9+" : unreadCount}
										</span>
									)}
								</button>

								{isBellOpen && (
									<div className="absolute right-0 top-12 w-88 animate-scale-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
										<div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
											<h3 className="text-sm font-semibold text-slate-900">
												Notifications
											</h3>
											{notifications.length > 0 && (
												<span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
													<CheckCheck size={12} /> All read
												</span>
											)}
										</div>
										<div className="scrollbar-slim max-h-88 overflow-y-auto">
											<NotificationList
												notifications={notifications}
												reviewPath={reviewPath}
												onNavigate={() => setIsBellOpen(false)}
											/>
										</div>
									</div>
								)}
							</div>

							<Link
								to="/profile"
								className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-slate-50"
								title="View profile"
							>
								<Avatar name={user.name} size="sm" />
								<span className="hidden text-xs font-semibold text-slate-700 lg:inline">
									{user.name?.split(" ")[0]}
								</span>
							</Link>

							<button
								type="button"
								onClick={handleLogout}
								title="Log out"
								aria-label="Log out"
								className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
							>
								<LogOut size={18} />
							</button>
						</div>
					) : (
						<div className="hidden items-center gap-3 md:flex">
							<Link
								to="/login"
								className="text-sm font-semibold text-slate-600 transition-colors hover:text-red-600"
							>
								Log in
							</Link>
							<Button as={Link} to="/signup" size="sm">
								Sign up
							</Button>
						</div>
					)}

					<button
						type="button"
						onClick={() => setIsMobileMenuOpen((open) => !open)}
						aria-label="Toggle menu"
						aria-expanded={isMobileMenuOpen}
						className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
					>
						{isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
					</button>
				</div>
			</div>

			{isMobileMenuOpen && (
				<div className="animate-slide-up border-t border-slate-100 bg-white px-4 py-5 shadow-lg md:hidden">
					{user ? (
						<div className="flex flex-col gap-1">
							<div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-4">
								<Avatar name={user.name} />
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-slate-900">
										{user.name}
									</p>
									<Badge
										className={`mt-1 ${ROLE_STYLES[user.role] ?? ROLE_STYLES.Unassigned}`}
									>
										{ROLE_LABELS[user.role] ?? user.role}
									</Badge>
								</div>
							</div>

							{navLinks.map(({ to, label, icon: Icon }) => (
								<NavLink
									key={to}
									to={to}
									className={navLinkClass}
									onClick={closeMobileMenu}
									end
								>
									<Icon size={16} />
									{label}
								</NavLink>
							))}

							<NavLink
								to="/profile"
								className={navLinkClass}
								onClick={closeMobileMenu}
								end
							>
								<User size={16} />
								Profile
							</NavLink>

							<button
								type="button"
								onClick={handleLogout}
								className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
							>
								<LogOut size={16} />
								Log out
							</button>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<Button
								as={Link}
								to="/login"
								variant="secondary"
								onClick={closeMobileMenu}
							>
								Log in
							</Button>
							<Button as={Link} to="/signup" onClick={closeMobileMenu}>
								Sign up
							</Button>
						</div>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
