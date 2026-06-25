import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function dashboardPathFor(user) {
  return user?.role === "admin" ? "/admin-dashboard" : "/";
}

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to={dashboardPathFor(user)} replace />;

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const nameRegex = /^[a-zA-Z\s.]+$/;
    if (!nameRegex.test(form.name.trim())) {
      setError("Name must only contain alphabets.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!emailRegex.test(form.email.trim())) {
      setError("Please enter a valid Gmail address (ending in @gmail.com).");
      setLoading(false);
      return;
    }

    const digits = form.phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("WhatsApp Mobile Number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    const result = await signup({
      ...form,
      phone: digits,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/");
  }

  return (
    <section className="page-shell grid min-h-[72vh] place-items-center">
      <div className="card w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-md bg-blush text-plum">
            <UserPlus size={26} />
          </span>
          <h1 className="font-display text-4xl font-bold text-plum">Signup</h1>
          <p className="mt-2 text-sm text-ink/60">Create your customer stitching profile.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-plum">
            Name
            <input
              className="input-field"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              placeholder="Your name"
            />
          </label>
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
            WhatsApp Mobile Number
            <input
              className="input-field"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="e.g. 9876543210"
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
                placeholder="Create password"
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
          {error && <p className="rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? <LoadingSpinner label="Creating account" /> : "Signup"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/65">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-rose hover:text-plum">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
