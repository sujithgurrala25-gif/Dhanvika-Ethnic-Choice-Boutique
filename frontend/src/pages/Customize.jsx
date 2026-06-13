import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import DressPreview from "../components/DressPreview.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  extraOptions,
  fittingOptions,
  neckStyles,
  sleeveStyles,
} from "../utils/data.js";
import { getDraft, saveDraft } from "../utils/storage.js";

export default function Customize() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const draft = useMemo(() => getDraft(user.id), [user.id]);
  const [customization, setCustomization] = useState(
    draft.customization || {
      neckStyle: "Boat Neck",
      sleeveStyle: "Short Sleeve",
      fittingStyle: "Regular Fit",
      extras: [],
    },
  );
  const [aiPreviewImage, setAiPreviewImage] = useState(
    draft.aiPreviewImage || null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const debounceTimer = useRef(null);

  // Auto-generate AI image when customization changes (with debounce)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      generateAiPreview();
    }, 1500); // Wait 1.5s after user stops changing options

    return () => clearTimeout(debounceTimer.current);
  }, [customization]);

  async function generateAiPreview() {
    if (!draft.selectedOutfit || !draft.fabricImage) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outfit: draft.selectedOutfit.title,
          neckStyle: customization.neckStyle || "Boat Neck",
          sleeveStyle: customization.sleeveStyle || "Short Sleeve",
          fittingStyle: customization.fittingStyle || "Regular Fit",
          extras: customization.extras || [],
          fabric: draft.fabricImage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn("Generation skipped:", error.error);
        return;
      }

      const data = await response.json();
      setAiPreviewImage(data.imageUrl);

      // Save to draft
      saveDraft(user.id, {
        aiPreviewImage: data.imageUrl,
      });
    } catch (error) {
      console.warn("AI generation skipped:", error.message);
      // Fail silently - show CSS preview as fallback
    } finally {
      setIsGenerating(false);
    }
  }

  if (!draft.selectedOutfit) {
    return (
      <section className="page-shell">
        <EmptyState
          title="No outfit draft found"
          message="Select an outfit and upload fabric before choosing design details."
          actionLabel="Select Outfit"
          actionTo="/select-outfit"
        />
      </section>
    );
  }

  function selectOption(key, value) {
    setCustomization({ ...customization, [key]: value });
  }

  function toggleExtra(option) {
    const current = customization.extras || [];
    const exists = current.includes(option);
    const extras = exists
      ? current.filter((item) => item !== option)
      : [...current, option];
    setCustomization({ ...customization, extras });
  }

  function handleNext() {
    saveDraft(user.id, { customization });
    navigate("/preview");
  }

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Customize</p>
        <h1 className="section-title">Shape the design details</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <OptionGroup
            title="Neck Style Options"
            items={neckStyles}
            value={customization.neckStyle}
            onSelect={(item) => selectOption("neckStyle", item)}
          />
          <OptionGroup
            title="Sleeve Style Options"
            items={sleeveStyles}
            value={customization.sleeveStyle}
            onSelect={(item) => selectOption("sleeveStyle", item)}
          />
          <OptionGroup
            title="Fitting Options"
            items={fittingOptions}
            value={customization.fittingStyle}
            onSelect={(item) => selectOption("fittingStyle", item)}
          />

          <div className="card p-5">
            <h2 className="mb-4 font-display text-2xl font-bold text-plum">
              Extra Options
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {extraOptions.map((option) => {
                const selected = customization.extras?.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleExtra(option)}
                    className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm font-bold transition ${
                      selected
                        ? "border-gold bg-gold/15 text-plum"
                        : "border-plum/10 bg-white text-ink/70 hover:border-rose"
                    }`}
                  >
                    {option}
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-md ${selected ? "bg-plum text-white" : "bg-lavender text-plum"}`}
                    >
                      <Check size={15} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <DressPreview
            outfit={draft.selectedOutfit}
            fabricImage={draft.fabricImage}
            customization={customization}
            aiPreviewImage={aiPreviewImage}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row">
        <Link to="/measurements" className="btn-secondary">
          Previous
        </Link>
        <button type="button" onClick={handleNext} className="btn-primary">
          <Sparkles size={17} />
          Next
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

function OptionGroup({ title, items, value, onSelect }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-2xl font-bold text-plum">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`rounded-md border px-4 py-3 text-left text-sm font-bold transition ${
              value === item
                ? "border-plum bg-plum text-white shadow-sm"
                : "border-plum/10 bg-white text-plum hover:border-rose hover:bg-blush/45"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
