import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function dashboardPathFor(user) {
  return user?.role === "admin" ? "/admin-dashboard" : "/";
}

export default function Login() {
  const { user, login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to={dashboardPathFor(user)} replace />;

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleForgotPassword() {
    if (!form.email) {
      setError("Please enter your email address first.");
      return;
    }

    const result = await resetPassword(form.email);

    if (result.ok) {
      setError("");
      alert(result.message);
    } else {
      setError(result.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(form);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(dashboardPathFor(result.user), { replace: true });
  }

  //for resetting password
  async function handleForgotPassword() {
    if (!form.email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    const result = await resetPassword(form.email);

    if (result.ok) {
      setError("");
      alert(
        "Password reset email has been sent. Please check your inbox and spam folder.",
      );
    } else {
      setError(result.message);
    }
  }

  return (
    <section className="page-shell grid min-h-[72vh] place-items-center">
      <div className="card w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-md bg-lavender text-plum">
            <LogIn size={26} />
          </span>
          <h1 className="font-display text-4xl font-bold text-plum">Login</h1>
          <p className="mt-2 text-sm text-ink/60">
            One login for customers and boutique admin.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-plum">
            Email
            <input
              className="input-field"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-plum">
            Password
            <div className="relative">
              <input
                className="input-field pr-10"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={4}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-plum/50 hover:text-plum"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-rose hover:text-plum"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <p className="rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner label="Signing in" /> : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/65">
          New customer?{" "}
          <Link to="/signup" className="font-bold text-rose hover:text-plum">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
