import { Inbox } from "lucide-react";
import { useCallback } from "react";
import toast from "react-hot-toast";

import {
	acceptRequest,
	denyRequest,
	fetchCompanyRequests,
} from "../api/notificationApi";
import RequestCard from "../components/RequestCard";
import EmptyState from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import useAsyncData from "../hooks/useAsyncData";

const CompanyRequests = () => {
	const loader = useCallback(() => fetchCompanyRequests(), []);
	const { data, isLoading, setData, reload } = useAsyncData(loader);

	const requests = data ?? [];

	const removeFromList = (notificationId) => {
		setData((current) =>
			(current ?? []).filter((request) => request._id !== notificationId),
		);
	};

	const handleAccept = async (notificationId) => {
		try {
			await acceptRequest(notificationId);
			removeFromList(notificationId);
			toast.success("Member added to your company");
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
					Company Join Requests
				</h1>
				<p className="mt-1 text-sm text-slate-500">
					Approve teammates who used your invite code. They join as Unassigned
					and can then request a project.
				</p>
			</header>

			{requests.length === 0 ? (
				<EmptyState
					icon={Inbox}
					title="No pending requests"
					description="Everyone who asked to join has been reviewed. Share your invite code to grow the team."
				/>
			) : (
				<div className="grid gap-5">
					{requests.map((request) => (
						<RequestCard
							key={request._id}
							request={request}
							context="company"
							onAccept={handleAccept}
							onDeny={handleDeny}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default CompanyRequests;
