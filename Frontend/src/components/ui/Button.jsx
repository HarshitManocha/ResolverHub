import Spinner from "./Spinner";

const VARIANTS = {
	primary:
		"bg-linear-to-r from-red-600 to-orange-500 text-white shadow-sm shadow-red-200 hover:opacity-90",
	secondary:
		"border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700",
	subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
	ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
	danger:
		"border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700",
	success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
};

const SIZES = {
	xs: "px-2.5 py-1.5 text-xs gap-1.5",
	sm: "px-3.5 py-2 text-xs gap-1.5",
	md: "px-5 py-2.5 text-sm gap-2",
	lg: "px-6 py-3 text-sm gap-2",
};

const Button = ({
	as: Component = "button",
	variant = "primary",
	size = "md",
	isLoading = false,
	disabled = false,
	className = "",
	children,
	...props
}) => (
	<Component
		disabled={Component === "button" ? disabled || isLoading : undefined}
		className={[
			"inline-flex items-center justify-center rounded-xl font-semibold transition-all",
			"active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
			VARIANTS[variant] ?? VARIANTS.primary,
			SIZES[size] ?? SIZES.md,
			className,
		].join(" ")}
		{...props}
	>
		{isLoading && <Spinner size="xs" />}
		{children}
	</Component>
);

export default Button;
