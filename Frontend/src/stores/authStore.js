import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
	persist(
		(set) => ({
			token: null,
			user: null,

			// True once we have checked the stored token against the API. Guards wait
			// for this so a refresh never bounces a signed in user to /login.
			isSessionReady: false,

			login: (token, user) => set({ token, user, isSessionReady: true }),

			logout: () => set({ token: null, user: null, isSessionReady: true }),

			setUser: (user) => set({ user }),

			patchUser: (changes) =>
				set((state) =>
					state.user ? { user: { ...state.user, ...changes } } : state,
				),

			setSessionReady: (isSessionReady) => set({ isSessionReady }),
		}),
		{
			name: "resolverhub-auth",
			partialize: ({ token, user }) => ({ token, user }),
		},
	),
);

export default useAuthStore;
