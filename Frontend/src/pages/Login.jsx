import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { login as loginRequest } from "../api/authApi";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { cardClass, controlClass } from "../lib/styles";
import useAuthStore from "../stores/authStore";

const Login = () => {
	const [form, setForm] = useState({ email: "", password: "" });
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

		setIsSubmitting(true);
		try {
			const session = await loginRequest(form);
			toast.success(`Welcome back, ${session.user.name.split(" ")[0]}!`);

			// RedirectIfAuthenticated handles the redirect once the store updates.
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
							<LogIn size={20} />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-slate-900">
							Welcome back
						</h1>
						<p className="mt-2 text-sm text-slate-500">
							Log in to get back to your bug vault.
						</p>
					</div>

					<div className="space-y-5">
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

						<Field label="Password" htmlFor="password">
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="••••••••"
									value={form.password}
									onChange={handleChange}
									required
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
							{isSubmitting ? "Logging in..." : "Log In"}
						</Button>

						<p className="text-center text-sm text-slate-500">
							Don&apos;t have an account?{" "}
							<Link
								to="/signup"
								className="font-semibold text-red-600 transition hover:text-red-700 hover:underline"
							>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Login;
