import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";

import {
	RedirectIfAuthenticated,
	RequireAuth,
	RequireCompany,
	RequireNoCompany,
	RequireProject,
	RequireRole,
} from "./components/guards/RouteGuards";
import { FullPageLoader } from "./components/ui/Spinner";
import Layout from "./layout/Layout";
import { bootstrapSession } from "./lib/session";
import CompanyRequests from "./pages/CompanyRequests";
import CompanySetup from "./pages/CompanySetup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProjectBugView from "./pages/ProjectBugView";
import ProjectRequests from "./pages/ProjectRequests";
import ProjectsView from "./pages/ProjectsView";
import Signup from "./pages/Signup";
import useAuthStore from "./stores/authStore";

const toastOptions = {
	duration: 3500,
	style: {
		background: "#ffffff",
		color: "#0f172a",
		border: "1px solid #e2e8f0",
		borderRadius: "0.875rem",
		padding: "12px 16px",
		fontFamily: "'Fira Code', monospace",
		fontWeight: 500,
		fontSize: "0.8125rem",
		boxShadow: "0 10px 25px -8px rgba(15, 23, 42, 0.18)",
	},
	success: {
		iconTheme: { primary: "#059669", secondary: "#ffffff" },
		style: { borderLeft: "4px solid #059669" },
	},
	error: {
		duration: 5000,
		iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
		style: { borderLeft: "4px solid #dc2626" },
	},
};

const App = () => {
	const isSessionReady = useAuthStore((state) => state.isSessionReady);

	useEffect(() => {
		bootstrapSession();
	}, []);

	// Guards read companyId/projectId from the store, so we must not render them
	// until the persisted token has been validated against the API.
	if (!isSessionReady) {
		return <FullPageLoader />;
	}

	return (
		<>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Home />} />

					<Route
						path="signup"
						element={
							<RedirectIfAuthenticated>
								<Signup />
							</RedirectIfAuthenticated>
						}
					/>
					<Route
						path="login"
						element={
							<RedirectIfAuthenticated>
								<Login />
							</RedirectIfAuthenticated>
						}
					/>

					<Route
						path="profile"
						element={
							<RequireAuth>
								<Profile />
							</RequireAuth>
						}
					/>

					<Route
						path="company/setup"
						element={
							<RequireAuth>
								<RequireNoCompany>
									<CompanySetup />
								</RequireNoCompany>
							</RequireAuth>
						}
					/>

					<Route
						path="company/projects"
						element={
							<RequireAuth>
								<RequireCompany>
									<ProjectsView />
								</RequireCompany>
							</RequireAuth>
						}
					/>

					<Route
						path="company/requests"
						element={
							<RequireAuth>
								<RequireCompany>
									<RequireRole roles={["Admin"]}>
										<CompanyRequests />
									</RequireRole>
								</RequireCompany>
							</RequireAuth>
						}
					/>

					<Route
						path="company/project-requests"
						element={
							<RequireAuth>
								<RequireCompany>
									<RequireRole roles={["ProjectAdmin"]}>
										<ProjectRequests />
									</RequireRole>
								</RequireCompany>
							</RequireAuth>
						}
					/>

					<Route
						path="company/my-project"
						element={
							<RequireAuth>
								<RequireCompany>
									<RequireProject>
										<ProjectBugView />
									</RequireProject>
								</RequireCompany>
							</RequireAuth>
						}
					/>

					{/* Read-only board a company admin opens from the projects grid. */}
					<Route
						path="company/projects/:projectId/bugs"
						element={
							<RequireAuth>
								<RequireCompany>
									<ProjectBugView />
								</RequireCompany>
							</RequireAuth>
						}
					/>

					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>

			<Toaster position="bottom-right" toastOptions={toastOptions} />
		</>
	);
};

export default App;
