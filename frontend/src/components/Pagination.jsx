export default function Pagination({ current, total, onChange }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const base =
    "inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded text-sm font-bold transition-colors duration-150 focus:outline-none select-none border";

  return (
    <div className="mt-8 flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={current === 1}
        className={`${base} ${
          current === 1
            ? "bg-white border-plum/20 text-plum/30 cursor-not-allowed"
            : "bg-white border-plum/20 text-plum hover:bg-lavender/50"
        }`}
      >
        « First
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`${base} ${
            p === current
              ? "bg-plum border-plum text-white shadow-sm"
              : "bg-white border-plum/20 text-plum hover:bg-lavender/50"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className={`${base} ${
          current === total
            ? "bg-white border-plum/20 text-plum/30 cursor-not-allowed"
            : "bg-white border-plum/20 text-plum hover:bg-lavender/50"
        }`}
      >
        Next »
      </button>

      <button
        type="button"
        onClick={() => onChange(total)}
        disabled={current === total}
        className={`${base} ${
          current === total
            ? "bg-white border-rose/20 text-rose/30 cursor-not-allowed"
            : "bg-white border-rose/30 text-rose hover:bg-rose/10"
        }`}
      >
        Last »
      </button>
    </div>
  );
}
