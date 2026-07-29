import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { login as loginRequest, signup } from "../api/authApi";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { cardClass, controlClass } from "../lib/styles";
import useAuthStore from "../stores/authStore";

const Signup = () => {
	const [form, setForm] = useState({ name: "", email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const login = useAuthStore((state) => state.login);

	const handleChange = (event) => {
		setForm((current) => ({
			...current,
			[event.target.name]: event.target.value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (isSubmitting) return;

		if (form.password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		setIsSubmitting(true);
		try {
			await signup(form);

			// Sign the new account straight in so they land on workspace setup.
			const session = await loginRequest({
				email: form.email,
				password: form.password,
			});

			toast.success(`Welcome aboard, ${session.user.name.split(" ")[0]}!`);

			// RedirectIfAuthenticated sends a company-less user to /company/setup.
			login(session.token, session.user);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<form onSubmit={handleSubmit} className="w-full max-w-md">
				<div className={`${cardClass} p-8`}>
					<div className="mb-8 text-center">
						<div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-orange-500 text-white shadow-md shadow-red-200">
							<UserPlus size={20} />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-slate-900">
							Create your account
						</h1>
						<p className="mt-2 text-sm text-slate-500">
							Start tracking bugs with your team in minutes.
						</p>
					</div>

					<div className="space-y-5">
						<Field label="Full Name" htmlFor="name">
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								placeholder="Jane Developer"
								value={form.name}
								onChange={handleChange}
								required
								disabled={isSubmitting}
								className={controlClass}
							/>
						</Field>

						<Field label="Email Address" htmlFor="email">
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="jane@example.com"
								value={form.email}
								onChange={handleChange}
								required
								disabled={isSubmitting}
								className={controlClass}
							/>
						</Field>

						<Field
							label="Password"
							htmlFor="password"
							hint="At least 6 characters."
						>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder="••••••••"
									value={form.password}
									onChange={handleChange}
									required
									minLength={6}
									disabled={isSubmitting}
									className={`${controlClass} pr-11`}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((shown) => !shown)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 transition hover:text-red-600"
								>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</Field>

						<Button
							type="submit"
							size="lg"
							isLoading={isSubmitting}
							className="w-full"
						>
							{isSubmitting ? "Creating account..." : "Sign Up"}
						</Button>

						<p className="text-center text-sm text-slate-500">
							Already have an account?{" "}
							<Link
								to="/login"
								className="font-semibold text-red-600 transition hover:text-red-700 hover:underline"
							>
								Log in
							</Link>
						</p>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Signup;
