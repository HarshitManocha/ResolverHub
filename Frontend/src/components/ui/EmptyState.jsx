const EmptyState = ({ icon: Icon, title, description, action }) => (
	<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
		{Icon && (
			<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
				<Icon size={26} />
			</div>
		)}
		<h3 className="text-base font-semibold text-slate-900">{title}</h3>
		{description && (
			<p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
		)}
		{action && <div className="mt-6">{action}</div>}
	</div>
);

export default EmptyState;
