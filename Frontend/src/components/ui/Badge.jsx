const Badge = ({ className = "", children, ...props }) => (
	<span
		className={[
			"inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5",
			"text-[10px] font-bold uppercase tracking-wider",
			className || "border-slate-200 bg-slate-50 text-slate-600",
		].join(" ")}
		{...props}
	>
		{children}
	</span>
);

export default Badge;
