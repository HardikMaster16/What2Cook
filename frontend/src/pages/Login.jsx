import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, googleLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      await login(form.email.trim(), form.password);

      navigate(from, { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google authentication did not return a valid credential.");
      return;
    }

    try {
      setError("");
      setSubmitting(true);

      await googleLogin(credentialResponse.credential);

      navigate(from, { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Google sign-in failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center bg-cream px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-walnut/10 bg-white p-6 shadow-sm shadow-walnut/5 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-walnut text-papaya">
              <LockKeyhole size={21} />
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-ink/60">
              Login to continue cooking with Fresse.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-ink/70"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={submitting}
                  className="w-full rounded-xl border border-walnut/20 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-walnut focus:ring-2 focus:ring-coral/25 disabled:bg-cream"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-ink/70"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={submitting}
                  className="w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 pr-11 text-sm outline-none transition focus:border-walnut focus:ring-2 focus:ring-coral/25 disabled:bg-cream"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 transition hover:text-walnut disabled:cursor-not-allowed"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-walnut px-4 py-3 font-semibold text-papaya transition hover:bg-walnut-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Loader2 size={18} className="animate-spin" />
              )}

              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-walnut/10" />

            <span className="text-xs font-medium uppercase tracking-wider text-ink/40">
              OR
            </span>

            <div className="h-px flex-1 bg-walnut/10" />
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="350"
            />
          </div>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-ink/60">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-walnut hover:text-walnut-dark"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
