import { Navigate, useLocation } from "react-router-dom";

import { landingPathFor } from "../../lib/navigation";
import useAuthStore from "../../stores/authStore";

/** Requires a signed in user. */
export const RequireAuth = ({ children }) => {
	const token = useAuthStore((state) => state.token);
	const location = useLocation();

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return children;
};

/**
 * Keeps signed in users away from /login and /signup. This also owns the
 * post sign in redirect: the auth pages only update the store, and this guard
 * decides where the fresh session belongs.
 */
export const RedirectIfAuthenticated = ({ children }) => {
	const token = useAuthStore((state) => state.token);
	const user = useAuthStore((state) => state.user);
	const location = useLocation();

	if (token) {
		return <Navigate to={location.state?.from ?? landingPathFor(user)} replace />;
	}

	return children;
};

/** Requires the user to belong to a company. */
export const RequireCompany = ({ children }) => {
	const user = useAuthStore((state) => state.user);

	if (!user?.companyId) {
		return <Navigate to="/company/setup" replace />;
	}

	return children;
};

/** Only for the workspace setup screen, which no longer applies once joined. */
export const RequireNoCompany = ({ children }) => {
	const user = useAuthStore((state) => state.user);

	if (user?.companyId) {
		return <Navigate to="/company/projects" replace />;
	}

	return children;
};

/** Requires the user to be assigned to a project. */
export const RequireProject = ({ children }) => {
	const user = useAuthStore((state) => state.user);

	if (!user?.projectId) {
		return <Navigate to="/company/projects" replace />;
	}

	return children;
};

/** Restricts a route to the given roles. */
export const RequireRole = ({ roles, children }) => {
	const user = useAuthStore((state) => state.user);

	if (!roles.includes(user?.role)) {
		return <Navigate to="/company/projects" replace />;
	}

	return children;
};
