import { getInitials } from "../../lib/format";

const SIZES = {
	sm: "h-8 w-8 text-xs",
	md: "h-10 w-10 text-sm",
	lg: "h-20 w-20 text-3xl",
};

const Avatar = ({ name, size = "md", className = "" }) => (
	<div
		className={[
			"flex shrink-0 items-center justify-center rounded-full font-bold text-white",
			"bg-linear-to-br from-red-600 to-orange-500",
			SIZES[size] ?? SIZES.md,
			className,
		].join(" ")}
		aria-hidden="true"
	>
		{getInitials(name, size === "lg" ? 1 : 2)}
	</div>
);

export default Avatar;
