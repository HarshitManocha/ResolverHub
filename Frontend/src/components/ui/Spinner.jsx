import { Loader2 } from "lucide-react";

const SIZES = {
	xs: "h-3.5 w-3.5",
	sm: "h-4 w-4",
	md: "h-6 w-6",
	lg: "h-9 w-9",
};

const Spinner = ({ size = "sm", className = "" }) => (
	<Loader2
		className={`animate-spin ${SIZES[size] ?? SIZES.sm} ${className}`}
		aria-hidden="true"
	/>
);

export const PageLoader = ({ label = "Loading..." }) => (
	<div
		className="flex min-h-[60vh] flex-col items-center justify-center gap-3"
		role="status"
		aria-live="polite"
	>
		<Spinner size="lg" className="text-red-600" />
		<p className="text-sm text-slate-500">{label}</p>
	</div>
);

export const FullPageLoader = ({ label = "Starting ResolverHub..." }) => (
	<div
		className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50"
		role="status"
		aria-live="polite"
	>
		<Spinner size="lg" className="text-red-600" />
		<p className="text-sm text-slate-500">{label}</p>
	</div>
);

export default Spinner;
