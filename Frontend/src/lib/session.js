import { fetchMyProfile } from "../api/profileApi";
import useAuthStore from "../stores/authStore";

/**
 * Pulls the authoritative user from the API. The stored user goes stale as soon
 * as an admin approves a join request, so anything that can change role,
 * company or project should call this afterwards.
 */
export const refreshSession = async () => {
	const { token, setUser } = useAuthStore.getState();
	if (!token) return null;

	const user = await fetchMyProfile();
	setUser(user);
	return user;
};

/** Runs once on boot: validates the stored token and unblocks the route guards. */
export const bootstrapSession = async () => {
	const { token, setSessionReady } = useAuthStore.getState();

	if (!token) {
		setSessionReady(true);
		return;
	}

	try {
		await refreshSession();
	} catch {
		// A 401 already cleared the session inside the API client; any other
		// failure (server down) keeps the cached user so the app stays usable.
	} finally {
		setSessionReady(true);
	}
};
