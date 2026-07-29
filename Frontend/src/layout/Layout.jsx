import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

const Layout = () => (
	<div className="flex min-h-screen flex-col bg-slate-50">
		<Navbar />
		<main className="flex-1">
			<Outlet />
		</main>
	</div>
);

export default Layout;
