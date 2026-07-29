import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
	fetchNotifications,
	markAllNotificationsRead,
} from "../api/notificationApi";
import useAuthStore from "../stores/authStore";

const POLL_INTERVAL_MS = 60_000;

const useNotifications = () => {
	const token = useAuthStore((state) => state.token);

	// Storing the token next to the items lets us derive an empty list the moment
	// the session changes, without clearing state from inside an effect.
	const [cache, setCache] = useState({ token: null, items: [] });
	const reloadRef = useRef(() => {});

	useEffect(() => {
		if (!token) return undefined;

		let isActive = true;

		const run = async () => {
			try {
				const data = await fetchNotifications();
				if (isActive) {
					setCache({ token, items: Array.isArray(data) ? data : [] });
				}
			} catch {
				// A failing bell should never break the page it lives on.
			}
		};

		reloadRef.current = run;
		run();

		const intervalId = setInterval(run, POLL_INTERVAL_MS);

		return () => {
			isActive = false;
			clearInterval(intervalId);
		};
	}, [token]);

	const notifications = useMemo(
		() => (cache.token === token ? cache.items : []),
		[cache, token],
	);

	const reload = useCallback(() => reloadRef.current(), []);

	const markAllRead = useCallback(async () => {
		if (!notifications.some((item) => !item.isRead)) return;

		setCache((current) => ({
			...current,
			items: current.items.map((item) => ({ ...item, isRead: true })),
		}));

		try {
			await markAllNotificationsRead();
		} catch {
			reloadRef.current();
		}
	}, [notifications]);

	const unreadCount = useMemo(
		() => notifications.filter((item) => !item.isRead).length,
		[notifications],
	);

	return { notifications, unreadCount, reload, markAllRead };
};

export default useNotifications;
