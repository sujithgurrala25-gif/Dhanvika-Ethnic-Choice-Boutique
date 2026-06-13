import { useEffect, useState } from "react";
import { Send, Star, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { outfitOptions } from "../utils/data.js";
import { createFeedback, fetchFeedback, deleteFeedback } from "../services/feedbackService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Feedback() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    message: "",
    outfitType: outfitOptions[0].title,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFeedback();
        setFeedbackList(data.feedback || []);
      } catch {
        // Show empty state silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const data = await createFeedback({
        name: user.name,
        outfit_type: form.outfitType,
        rating: Number(form.rating),
        message: form.message.trim(),
      });
      setFeedbackList([data.feedback, ...feedbackList]);
      setForm({ ...form, rating: 5, message: "" });
      setSuccess("Thank you for sharing your review.");
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await deleteFeedback(id);
      setFeedbackList(feedbackList.filter((item) => item.id !== id));
      setSuccess("Feedback deleted successfully.");
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete feedback.");
      setSuccess("");
    }
  }

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Feedback</p>
        <h1 className="section-title">Share your boutique experience</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="card grid gap-5 p-5" onSubmit={handleSubmit}>
          <div>
            <p className="mb-3 text-sm font-bold text-plum">Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setForm({ ...form, rating })}
                  className={`grid h-11 w-11 place-items-center rounded-md border transition ${
                    rating <= form.rating ? "border-gold bg-gold/15 text-gold" : "border-plum/10 bg-white text-ink/35"
                  }`}
                  aria-label={`${rating} star rating`}
                >
                  <Star size={21} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-2 text-sm font-bold text-plum">
            Outfit Type
            <select
              className="input-field"
              value={form.outfitType}
              onChange={(event) => setForm({ ...form, outfitType: event.target.value })}
            >
              {outfitOptions.map((outfit) => (
                <option key={outfit.id}>{outfit.title}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-plum">
            Feedback Message
            <textarea
              className="input-field min-h-36 resize-y"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              required
              placeholder="Write your review"
            />
          </label>

          {success && <p className="rounded-md bg-lavender px-4 py-3 text-sm font-semibold text-plum">{success}</p>}
          {error && <p className="rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? <LoadingSpinner label="Submitting" /> : <><Send size={17} /> Submit Feedback</>}
          </button>
        </form>

        <div className="grid gap-4">
          {loading ? (
            <div className="card p-8 flex items-center justify-center">
              <LoadingSpinner label="Loading reviews" />
            </div>
          ) : feedbackList.length ? (
            feedbackList.map((item) => (
              <article key={item.id} className="card p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="font-bold text-plum">{item.name}</p>
                    <p className="text-xs font-bold uppercase text-rose">{item.outfit_type || item.outfitType}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 text-gold">
                      {Array.from({ length: item.rating }).map((_, index) => (
                        <Star key={index} size={16} fill="currentColor" />
                      ))}
                    </div>
                    {user && (user.role === "admin" || user.id === item.user_id) && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-rose/70 hover:text-rose p-1 rounded transition hover:bg-rose/5"
                        title="Delete feedback"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink/70">{item.message}</p>
              </article>
            ))
          ) : (
            <div className="card p-8 text-center">
              <p className="font-display text-2xl font-bold text-plum">No reviews yet</p>
              <p className="mt-2 text-sm text-ink/60">Customer reviews will appear here and on the home page.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
