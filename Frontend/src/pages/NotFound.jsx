import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../components/ui/Button";

const NotFound = () => (
	<div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
		<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
			<Compass size={30} />
		</div>
		<p className="text-sm font-bold uppercase tracking-widest text-red-600">
			404
		</p>
		<h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
			This page took a wrong turn
		</h1>
		<p className="mt-3 max-w-md text-sm text-slate-500">
			The page you are looking for does not exist or may have been moved.
		</p>
		<Button as={Link} to="/" className="mt-8">
			Back to home
		</Button>
	</div>
);

export default NotFound;
