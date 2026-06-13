import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit3, ShoppingBag } from "lucide-react";
import DressPreview from "../components/DressPreview.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getDraft } from "../utils/storage.js";

export default function Preview() {
  const { user } = useAuth();
  const draft = useMemo(() => getDraft(user.id), [user.id]);
  const customization = draft.customization || {};
  const measurementEntries = Object.entries(draft.measurements || {});

  if (!draft.selectedOutfit || !draft.measurements || !draft.customization) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Preview is waiting"
          message="Complete outfit selection, fabric upload, measurements, and customization to see the stitched outlook."
          actionLabel="Start Designing"
          actionTo="/select-outfit"
        />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Preview</p>
        <h1 className="section-title">Approximate stitched outfit outlook</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <DressPreview
          outfit={draft.selectedOutfit}
          fabricImage={draft.fabricImage}
          customization={customization}
          measurements={draft.measurements}
          unit={draft.unit}
        />

        <div className="grid gap-5">
          <div className="card p-5">
            <h2 className="font-display text-2xl font-bold text-plum">
              Design Summary
            </h2>
            <div className="mt-4 grid gap-3 text-sm">
              <SummaryRow
                label="Outfit Type"
                value={draft.selectedOutfit.title}
              />
              <SummaryRow label="Neck Style" value={customization.neckStyle} />
              <SummaryRow
                label="Sleeve Style"
                value={customization.sleeveStyle}
              />
              <SummaryRow
                label="Fitting Type"
                value={customization.fittingStyle}
              />
              <SummaryRow
                label="Extra Options"
                value={(customization.extras || []).join(", ") || "None"}
              />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-2xl font-bold text-plum">
              Measurements Summary
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {measurementEntries.map(([key, value]) => (
                <div key={key} className="rounded-md bg-cream px-4 py-3">
                  <p className="text-xs font-bold uppercase text-gold">{key}</p>
                  <p className="font-bold text-plum">
                    {value} {draft.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/customize" className="btn-secondary flex-1">
              <Edit3 size={17} />
              Edit
            </Link>
            <Link to="/place-order" className="btn-primary flex-1">
              <ShoppingBag size={17} />
              Place Order
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-cream px-4 py-3">
      <span className="font-semibold text-ink/60">{label}</span>
      <span className="text-right font-bold text-plum">{value}</span>
    </div>
  );
}
