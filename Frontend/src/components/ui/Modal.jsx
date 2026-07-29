import { X } from "lucide-react";
import { useEffect } from "react";

const SIZES = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-2xl",
};

const Modal = ({
	isOpen,
	onClose,
	title,
	icon: Icon,
	size = "md",
	children,
}) => {
	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (event) => {
			if (event.key === "Escape") onClose();
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
			onClick={onClose}
			role="presentation"
		>
			<div className="flex min-h-full items-start justify-center py-6 sm:items-center">
				<div
					className={`flex w-full ${
						SIZES[size] ?? SIZES.md
					} max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-scale-in`}
					onClick={(event) => event.stopPropagation()}
					role="dialog"
					aria-modal="true"
					aria-label={title}
				>
					{/* Header */}
					<div className="flex items-center justify-between border-b border-slate-100 p-6">
						<h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
							{Icon && (
								<span className="flex h-6 w-6 items-center justify-center rounded-md bg-linear-to-br from-red-600 to-orange-500 text-white">
									<Icon size={14} />
								</span>
							)}
							{title}
						</h2>

						<button
							type="button"
							onClick={onClose}
							aria-label="Close dialog"
							className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
						>
							<X size={20} />
						</button>
					</div>

					{/* Scrollable Body */}
					<div className="flex-1 overflow-y-auto p-6">{children}</div>
				</div>
			</div>
		</div>
	);
};

export default Modal;
