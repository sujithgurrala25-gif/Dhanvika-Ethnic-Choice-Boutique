import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, Pencil, X, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Profile() {
  const { user, updateUserProfile, changeUserPassword } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Password Change Form State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCancel() {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setSuccess("");
    setError("");
    setIsEditing(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Basic validation
    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: cleanPhone,
      });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancelPassword() {
    setPassForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordSuccess("");
    setPasswordError("");
    setShowPasswordForm(false);
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (passForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changeUserPassword(passForm.oldPassword, passForm.newPassword);
      setPasswordSuccess("Password updated successfully!");
      setPassForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess("");
      }, 3000);
    } catch (err) {
      let friendlyMsg = err.message || "Failed to update password.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        friendlyMsg = "Incorrect current password.";
      }
      setPasswordError(friendlyMsg);
    } finally {
      setPasswordLoading(false);
    }
  }

  const dashboardPath = user?.role === "admin" ? "/admin-dashboard" : "/user-dashboard";

  return (
    <section className="page-shell grid min-h-[70vh] place-items-center py-8">
      <div className="card w-full max-w-lg p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-blush text-plum">
              <User size={24} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-gold">Account Settings</p>
              <h1 className="font-display text-3xl font-bold text-plum">
                {isEditing ? "Edit Profile" : "Profile Details"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary inline-flex items-center gap-2 py-2"
                title="Edit Profile"
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="btn-secondary inline-flex items-center gap-2 py-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>

        {/* Profile Info Form */}
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-plum">
            Full Name
            <input
              className={`input-field ${!isEditing ? "bg-cream/30 cursor-not-allowed opacity-80 border-transparent shadow-none" : ""}`}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={!isEditing}
              minLength={2}
              placeholder="Your full name"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-plum">
            Email Address
            <input
              className={`input-field ${!isEditing ? "bg-cream/30 cursor-not-allowed opacity-80 border-transparent shadow-none" : ""}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={!isEditing}
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-plum">
            WhatsApp Mobile Number
            <input
              className={`input-field ${!isEditing ? "bg-cream/30 cursor-not-allowed opacity-80 border-transparent shadow-none" : ""}`}
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              disabled={!isEditing}
              placeholder="e.g. 9876543210"
            />
          </label>

          {success && (
            <p className="rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {success}
            </p>
          )}

          {error && (
            <p className="rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
              {error}
            </p>
          )}

          {isEditing && (
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex-1 inline-flex justify-center items-center gap-2 py-3"
                disabled={loading}
              >
                <X size={18} />
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 inline-flex justify-center items-center gap-2 py-3"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner label="Saving" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Change Password Section */}
        {!showPasswordForm ? (
          <div className="mt-6 border-t border-lavender/30 pt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4 w-full justify-center"
              disabled={isEditing}
            >
              <Key size={16} />
              Change Password
            </button>
          </div>
        ) : (
          <div className="mt-6 border-t border-lavender/30 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-plum flex items-center gap-2">
                <Key size={18} />
                Change Password
              </h3>
              <button
                type="button"
                onClick={handleCancelPassword}
                className="text-plum/60 hover:text-plum p-1"
                disabled={passwordLoading}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="grid gap-4">
              <label className="grid gap-1 text-sm font-bold text-plum">
                Current Password
                <input
                  className="input-field"
                  type="password"
                  name="oldPassword"
                  value={passForm.oldPassword}
                  onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                  required
                  placeholder="Enter current password"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-plum">
                New Password
                <input
                  className="input-field"
                  type="password"
                  name="newPassword"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold text-plum">
                Confirm New Password
                <input
                  className="input-field"
                  type="password"
                  name="confirmPassword"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  required
                  placeholder="Re-type new password"
                />
              </label>

              {passwordSuccess && (
                <p className="rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  {passwordSuccess}
                </p>
              )}

              {passwordError && (
                <p className="rounded-md bg-rose/10 px-4 py-2 text-sm font-semibold text-rose">
                  {passwordError}
                </p>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="btn-secondary flex-1 py-2"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? <LoadingSpinner label="Updating" /> : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
