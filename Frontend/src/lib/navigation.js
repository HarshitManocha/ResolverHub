/**
 * The screen that is actually useful to a user given their current membership.
 * Both the auth pages and RedirectIfAuthenticated resolve their destination
 * here so a fresh sign in can never race the guard to a different route.
 */
export const landingPathFor = (user) => {
	if (!user?.companyId) return "/company/setup";
	if (user.role === "Admin") return "/company/projects";
	if (user.projectId) return "/company/my-project";
	return "/company/projects";
};

export default landingPathFor;
