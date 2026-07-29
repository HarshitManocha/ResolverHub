import { labelClass } from "../../lib/styles";

const Field = ({ label, htmlFor, hint, error, children }) => (
	<div>
		{label && (
			<label className={labelClass} htmlFor={htmlFor}>
				{label}
			</label>
		)}
		{children}
		{error ? (
			<p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
		) : (
			hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
		)}
	</div>
);

export default Field;
