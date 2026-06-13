import { Ruler, X } from "lucide-react";

export default function MeasurementModal({ field, instruction, onClose }) {
  if (!field) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-plum/45 px-4 backdrop-blur-sm">
      <div className="card w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-plum/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-lavender text-plum">
              <Ruler size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-gold">
                How to Measure
              </p>
              <h3 className="font-display text-2xl font-bold text-plum">
                {field.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md bg-cream text-plum"
            onClick={onClose}
            aria-label="Close measurement guide"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 rounded-lg border border-gold/30 bg-cream p-4">
            <div className="mx-auto grid h-40 max-w-xs place-items-center rounded-md bg-white">
              <div className="relative h-32 w-24 rounded-t-full border-4 border-plum/30">
                <span className="absolute left-1/2 top-5 h-14 w-16 -translate-x-1/2 rounded-full border-2 border-dashed border-rose" />
                <span className="absolute bottom-5 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-gold" />
              </div>
            </div>
          </div>
          <p className="text-sm leading-6 text-ink/70">{instruction}</p>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary mt-5 w-full"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
