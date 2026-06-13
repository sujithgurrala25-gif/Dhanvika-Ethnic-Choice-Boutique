import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function EmptyState({ title, message, actionLabel, actionTo, onClick }) {
  return (
    <div className="card mx-auto max-w-2xl px-6 py-12 text-center">
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-md bg-lavender text-plum">
        <Sparkles size={26} />
      </span>
      <h2 className="font-display text-3xl font-bold text-plum">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/65">{message}</p>
      {actionLabel && (
        onClick ? (
          <button type="button" onClick={onClick} className="btn-primary mt-6">
            {actionLabel}
          </button>
        ) : actionTo ? (
          <Link to={actionTo} className="btn-primary mt-6">
            {actionLabel}
          </Link>
        ) : null
      )}
    </div>
  );
}
