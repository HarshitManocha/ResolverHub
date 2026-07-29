import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

/**
 * Loads data once per `loader` identity and exposes helpers to refresh or patch
 * it. `loader` must be a stable reference, so wrap it in useCallback.
 *
 * State is only written from promise callbacks, which keeps renders predictable
 * and avoids the cascading updates that synchronous effect writes cause.
 */
const useAsyncData = (loader) => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		loader()
			.then((result) => {
				if (isMountedRef.current) setData(result);
			})
			.catch((error) => {
				if (isMountedRef.current) toast.error(error.message);
			})
			.finally(() => {
				if (isMountedRef.current) setIsLoading(false);
			});

		return () => {
			isMountedRef.current = false;
		};
	}, [loader]);

	const reload = useCallback(async () => {
		try {
			const result = await loader();
			if (isMountedRef.current) setData(result);
			return result;
		} catch (error) {
			toast.error(error.message);
			return undefined;
		}
	}, [loader]);

	return { data, isLoading, setData, reload };
};

export default useAsyncData;
