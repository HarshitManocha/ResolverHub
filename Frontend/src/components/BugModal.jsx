import { Bug } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { BUG_PRIORITIES } from "../lib/constants";
import { controlClass } from "../lib/styles";
import Button from "./ui/Button";
import Field from "./ui/Field";
import Modal from "./ui/Modal";

const EMPTY_FORM = { title: "", description: "", priority: "Medium" };

const BugModal = ({ isOpen, onClose, onSubmit }) => {
	const [form, setForm] = useState(EMPTY_FORM);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (event) => {
		setForm((current) => ({
			...current,
			[event.target.name]: event.target.value,
		}));
	};

	const handleClose = () => {
		if (isSubmitting) return;
		setForm(EMPTY_FORM);
		onClose();
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		try {
			await onSubmit({
				title: form.title.trim(),
				description: form.description.trim(),
				priority: form.priority,
			});
			toast.success("Bug reported successfully");
			setForm(EMPTY_FORM);
			onClose();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Report a New Bug"
			icon={Bug}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Field label="Bug Title" htmlFor="bug-title">
					<input
						id="bug-title"
						name="title"
						type="text"
						value={form.title}
						onChange={handleChange}
						required
						disabled={isSubmitting}
						placeholder="Login button unresponsive on mobile"
						className={controlClass}
					/>
				</Field>

				<Field
					label="Description"
					htmlFor="bug-description"
					hint="Steps to reproduce, expected result and what actually happens."
				>
					<textarea
						id="bug-description"
						name="description"
						rows={5}
						value={form.description}
						onChange={handleChange}
						required
						disabled={isSubmitting}
						placeholder={"1. Open /login on iOS Safari\n2. Tap Log In\n3. Nothing happens"}
						className={`${controlClass} resize-none`}
					/>
				</Field>

				<Field label="Priority" htmlFor="bug-priority">
					<select
						id="bug-priority"
						name="priority"
						value={form.priority}
						onChange={handleChange}
						disabled={isSubmitting}
						className={controlClass}
					>
						{BUG_PRIORITIES.map((priority) => (
							<option key={priority} value={priority}>
								{priority}
							</option>
						))}
					</select>
				</Field>

				<div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
					<Button
						type="button"
						variant="ghost"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" isLoading={isSubmitting}>
						{isSubmitting ? "Reporting..." : "Submit Bug"}
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default BugModal;
