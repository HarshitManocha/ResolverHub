export const getInitials = (name, length = 1) => {
	if (!name?.trim()) return "?";

	const parts = name.trim().split(/\s+/);

	if (length === 1 || parts.length === 1) {
		return parts[0].slice(0, length).toUpperCase();
	}

	return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const formatDate = (value) => {
	if (!value) return "";

	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export const formatDateTime = (value) => {
	if (!value) return "";

	return new Date(value).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const UNITS = [
	["year", 31536000],
	["month", 2592000],
	["day", 86400],
	["hour", 3600],
	["minute", 60],
];

export const formatRelativeTime = (value) => {
	if (!value) return "";

	const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
	if (seconds < 60) return "just now";

	for (const [unit, unitSeconds] of UNITS) {
		const amount = Math.floor(seconds / unitSeconds);
		if (amount >= 1) {
			return `${amount} ${unit}${amount > 1 ? "s" : ""} ago`;
		}
	}

	return "just now";
};

export const shortId = (id) => (id ? `#${String(id).slice(-6)}` : "");
