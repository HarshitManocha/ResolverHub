import { Inbox } from "lucide-react";
import { useCallback } from "react";
import toast from "react-hot-toast";

import {
	acceptRequest,
	denyRequest,
	fetchProjectRequests,
} from "../api/notificationApi";
import RequestCard from "../components/RequestCard";
import EmptyState from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import useAsyncData from "../hooks/useAsyncData";

const ProjectRequests = () => {
	const loader = useCallback(() => fetchProjectRequests(), []);
	const { data, isLoading, setData, reload } = useAsyncData(loader);

	const requests = data ?? [];

	const removeFromList = (notificationId) => {
		setData((current) =>
			(current ?? []).filter((request) => request._id !== notificationId),
		);
	};

	const handleAccept = async (notificationId, role) => {
		try {
			await acceptRequest(notificationId, role);
			removeFromList(notificationId);
			toast.success(`Member added to the project as ${role}`);
		} catch (error) {
			toast.error(error.message);
			reload();
		}
	};

	const handleDeny = async (notificationId) => {
		try {
			await denyRequest(notificationId);
			removeFromList(notificationId);
			toast.success("Request declined");
		} catch (error) {
			toast.error(error.message);
			reload();
		}
	};

	if (isLoading) {
		return <PageLoader label="Loading join requests..." />;
	}

	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
			<header className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					Project Join Requests
				</h1>
				<p className="mt-1 text-sm text-slate-500">
					Pick a role when you accept. Testers report and close bugs, developers
					move them to In Progress and Resolved.
				</p>
			</header>

			{requests.length === 0 ? (
				<EmptyState
					icon={Inbox}
					title="No pending requests"
					description="Your project roster is fully managed. New requests will appear here."
				/>
			) : (
				<div className="grid gap-5">
					{requests.map((request) => (
						<RequestCard
							key={request._id}
							request={request}
							context="project"
							onAccept={handleAccept}
							onDeny={handleDeny}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default ProjectRequests;
