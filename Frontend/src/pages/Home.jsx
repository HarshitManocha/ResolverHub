import {
	ArrowRight,
	Bug,
	CheckCircle2,
	Lock,
	Shield,
	Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import useAuthStore from "../stores/authStore";

const FEATURES = [
	{
		index: "01.",
		title: "Assign.",
		description:
			"Stop asking who is working on this. Every bug gets an owner, so accountability is never in question.",
		icon: Shield,
		glow: "shadow-red-900/20",
		color: "text-red-500",
	},
	{
		index: "02.",
		title: "Track.",
		description:
			"Watch resolution unfold. Priorities, statuses and a full comment thread live on every single bug.",
		icon: Bug,
		glow: "shadow-orange-900/20",
		color: "text-orange-500",
	},
	{
		index: "03.",
		title: "Squash.",
		description:
			"Ship with confidence. Testers verify and close, so a resolved bug stays resolved.",
		icon: CheckCircle2,
		glow: "shadow-emerald-900/20",
		color: "text-emerald-500",
	},
];

const Home = () => {
	const user = useAuthStore((state) => state.user);

	const primaryCta = !user
		? { to: "/signup", label: "Get Started Free" }
		: !user.companyId
			? { to: "/company/setup", label: "Set Up Your Workspace" }
			: user.projectId
				? { to: "/company/my-project", label: "Open Your Workspace" }
				: { to: "/company/projects", label: "Browse Projects" };

	return (
		<div className="w-full bg-white">
			<section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 py-20">
				<div
					className="pointer-events-none absolute -left-24 top-16 h-72 w-72 animate-pulse rounded-full bg-red-100/60 blur-3xl"
					aria-hidden="true"
				/>
				<div
					className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 animate-pulse rounded-full bg-orange-100/50 blur-3xl"
					style={{ animationDelay: "2s" }}
					aria-hidden="true"
				/>

				<Bug
					className="pointer-events-none absolute left-[12%] top-[22%] hidden h-8 w-8 animate-bounce text-red-200 lg:block"
					style={{ animationDuration: "3s" }}
					aria-hidden="true"
				/>
				<Zap
					className="pointer-events-none absolute right-[16%] top-[28%] hidden h-7 w-7 animate-bounce text-orange-200 lg:block"
					style={{ animationDuration: "4s", animationDelay: "1s" }}
					aria-hidden="true"
				/>
				<span
					className="pointer-events-none absolute bottom-[22%] left-[20%] hidden animate-pulse text-2xl font-bold text-slate-200 lg:block"
					aria-hidden="true"
				>
					{"{ }"}
				</span>
				<span
					className="pointer-events-none absolute bottom-[28%] right-[14%] hidden animate-pulse text-2xl font-bold text-slate-200 lg:block"
					style={{ animationDelay: "1.5s" }}
					aria-hidden="true"
				>
					{"</>"}
				</span>

				<div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
					<span className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
						<Lock size={13} />
						Secure bug tracking for modern teams
					</span>

					<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
						Don&apos;t let bugs run wild.
						<br className="hidden sm:block" />
						<span className="bg-linear-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
							Lock them in the vault.
						</span>
					</h1>

					<p className="mx-auto mt-6 max-w-2xl text-base text-slate-500 sm:text-lg">
						ResolverHub is the developer-first workspace that brings order to the
						chaos. Capture, assign and squash bugs before they reach production.
					</p>

					<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
						<Button as={Link} to={primaryCta.to} size="lg" className="group">
							{primaryCta.label}
							<ArrowRight
								size={17}
								className="transition-transform group-hover:translate-x-1"
							/>
						</Button>

						{!user && (
							<Link
								to="/login"
								className="text-sm font-semibold text-slate-500 transition-colors hover:text-red-600"
							>
								or log in to your account
							</Link>
						)}
					</div>
				</div>
			</section>

			<section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
				<div
					className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-red-600/20 to-orange-500/20 blur-[100px]"
					aria-hidden="true"
				/>

				<div className="relative z-10 mx-auto max-w-5xl px-6">
					<div className="space-y-24 sm:space-y-32">
						{FEATURES.map(
							({ index, title, description, icon: Icon, glow, color }, position) => (
								<div
									key={title}
									className={`flex flex-col items-center gap-8 md:justify-between ${
										position % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
									}`}
								>
									<div className="space-y-4 md:w-1/2">
										<span className="text-4xl font-black text-slate-800">
											{index}
										</span>
										<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
											{title}
										</h2>
										<p className="text-base text-slate-400">{description}</p>
									</div>

									<div
										className={`flex h-56 w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-md md:w-5/12 ${glow}`}
									>
										<Icon className={`h-20 w-20 opacity-80 ${color}`} strokeWidth={1} />
									</div>
								</div>
							),
						)}
					</div>
				</div>
			</section>

			<section className="bg-slate-950 pb-28 text-center">
				<div className="mx-auto max-w-3xl px-6">
					<h2 className="text-3xl font-bold text-white sm:text-4xl">
						Ready to bring order to the chaos?
					</h2>
					<p className="mt-4 text-base text-slate-400">
						Create a workspace, invite your team and start tracking bugs in
						minutes.
					</p>

					<div className="mt-10 flex justify-center">
						<Button as={Link} to={primaryCta.to} size="lg" className="group">
							{primaryCta.label}
							<ArrowRight
								size={17}
								className="transition-transform group-hover:translate-x-1"
							/>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
