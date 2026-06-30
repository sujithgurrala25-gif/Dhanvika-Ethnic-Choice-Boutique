import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, HelpCircle } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import MeasurementModal from "../components/MeasurementModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  measureInstructions,
  measurementFieldsByOutfit,
} from "../utils/data.js";
import { getDraft, saveDraft } from "../utils/storage.js";
import { validateMeasurement } from "../utils/validation.js";

export default function Measurements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const draft = useMemo(() => getDraft(user.id), [user.id]);
  const outfit = draft.selectedOutfit;
  const fields = measurementFieldsByOutfit[outfit?.id] || [];
  const [measurements, setMeasurements] = useState(draft.measurements || {});
  const [unit, setUnit] = useState(draft.unit || "Inches");
  const [errors, setErrors] = useState({});
  const [activeField, setActiveField] = useState(null);

  if (!outfit) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Measurements need an outfit"
          message="Select a stitching type first so the correct measurement form can be loaded."
          actionLabel="Select Outfit"
          actionTo="/select-outfit"
        />
      </section>
    );
  }

  function handleChange(key, value) {
    setMeasurements({ ...measurements, [key]: value });
    setErrors({ ...errors, [key]: "" });
  }

  function validate() {
    const nextErrors = {};
    fields.forEach((field) => {
      const errMsg = validateMeasurement(field.key, measurements[field.key], unit);
      if (errMsg) {
        nextErrors[field.key] = errMsg;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    saveDraft(user.id, { measurements, unit });
    navigate("/customize");
  }

  return (
    <section className="page-shell">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">
            Enter Measurements
          </p>
          <h1 className="section-title">{outfit.title} measurements</h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink/68">
            Add measurements in inches or centimeters. Each value is checked
            before moving forward.
          </p>
        </div>
        <div className="flex rounded-md bg-white p-1 shadow-sm">
          {["Inches", "CM"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setUnit(item)}
              className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                unit === item
                  ? "bg-plum text-white"
                  : "text-plum hover:bg-lavender"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className="rounded-lg border border-plum/10 bg-cream/60 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor={field.key}
                  className="text-sm font-bold text-plum"
                >
                  {field.name}
                </label>
                <button
                  type="button"
                  onClick={() => setActiveField(field)}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-xs font-bold text-rose shadow-sm hover:text-plum"
                >
                  <HelpCircle size={15} />
                  How to Measure?
                </button>
              </div>
              <input
                id={field.key}
                className="input-field"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={measurements[field.key] || ""}
                onChange={(event) =>
                  handleChange(field.key, event.target.value)
                }
                placeholder={`Enter ${field.name.toLowerCase()} in ${unit}`}
              />
              {errors[field.key] && (
                <p className="mt-2 text-xs font-bold text-rose">
                  {errors[field.key]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row">
        <Link to="/upload-fabric" className="btn-secondary">
          Previous
        </Link>
        <button type="button" onClick={handleNext} className="btn-primary">
          Next
          <ArrowRight size={17} />
        </button>
      </div>

      <MeasurementModal
        field={activeField}
        instruction={
          measureInstructions[activeField?.key] ||
          "Measure comfortably without pulling the tape too tight."
        }
        onClose={() => setActiveField(null)}
      />
    </section>
  );
}
