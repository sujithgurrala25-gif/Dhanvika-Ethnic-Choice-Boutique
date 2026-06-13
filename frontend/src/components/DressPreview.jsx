import { useState } from "react";
import { CheckCircle2, Rotate3d, Eye, Image as ImageIcon } from "lucide-react";
import { boutiqueImages } from "../assets/images.js";
import BlousePreview from "./BlousePreview.jsx";
import KurtiPreview from "./KurtiPreview.jsx";
import FrockPreview from "./FrockPreview.jsx";
import LehengaPreview from "./LehengaPreview.jsx";

export default function DressPreview({
  outfit,
  fabricImage,
  customization = {},
  measurements = {},
  unit = "Inches",
  compact = false,
}) {
  const [view, setView] = useState("front"); // "front" | "back" | "side"
  const [is3D, setIs3D] = useState(false);

  const outfitId = outfit?.id || "kurti";
  const fabric = fabricImage || boutiqueImages.fabricSilk;

  // Render the appropriate 2D SVG preview component
  const renderGarmentPreview = () => {
    const props = {
      fabricImage: fabric,
      customization,
      measurements,
      unit,
      view,
    };

    switch (outfitId) {
      case "blouse":
        return <BlousePreview {...props} />;
      case "long-frock":
      case "frock":
        return <FrockPreview {...props} />;
      case "lehenga":
        return <LehengaPreview {...props} />;
      case "kurti":
      default:
        return <KurtiPreview {...props} />;
    }
  };

  return (
    <div
      className={`dress-stage card overflow-hidden ${compact ? "p-4" : "p-6"} flex flex-col justify-between`}
    >
      {/* Header Info & Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-gold">
            Stitching Preview
          </p>
          <h3 className="font-display text-2xl font-bold text-plum">
            {outfit?.title || "Custom Outfit"}
          </h3>
        </div>

        {/* 2D vs 3D toggle (Three.js preparation) */}
        <div className="inline-flex rounded-md bg-lavender/60 p-1">
          <button
            type="button"
            onClick={() => setIs3D(false)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition ${
              !is3D
                ? "bg-plum text-white shadow-sm"
                : "text-plum hover:bg-plum/10"
            }`}
          >
            <ImageIcon size={14} />
            2D Sketch
          </button>
          <button
            type="button"
            onClick={() => setIs3D(true)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition ${
              is3D
                ? "bg-plum text-white shadow-sm"
                : "text-plum hover:bg-plum/10"
            }`}
          >
            <Rotate3d size={14} />
            3D Canvas
          </button>
        </div>
      </div>

      {/* Main Preview Screen */}
      <div className="relative flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-plum/5 bg-cream/40 py-6 shadow-inner">
        {is3D ? (
          /* Three.js Interactive Canvas Placeholder */
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 animate-ping rounded-full bg-gold/10" />
              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-gold/20 text-gold">
                <Rotate3d
                  size={32}
                  className="animate-spin"
                  style={{ animationDuration: "6s" }}
                />
              </div>
            </div>
            <h4 className="font-display text-lg font-bold text-plum">
              Three.js Engine Initializing
            </h4>
            <p className="mt-2 max-w-xs text-xs leading-5 text-ink/60">
              Ready for real-time 3D GLTF Model mapping. Drag to rotate and view
              fabric textures once model files are attached.
            </p>
            <div className="mt-4 rounded bg-white px-3 py-1.5 text-[10px] font-mono text-plum shadow-sm">
              loader.load('/models/{outfitId}.gltf')
            </div>
          </div>
        ) : (
          /* Realistic 2D SVG Garment Preview */
          <div className="relative w-full flex justify-center items-center">
            {renderGarmentPreview()}

            {/* Float watermark/helper */}
            <span className="absolute bottom-2 right-4 text-[10px] font-bold uppercase tracking-wider text-plum/30">
              Dhanvika Studio Sketch
            </span>
          </div>
        )}
      </div>

      {/* View Switcher Tabs (Only shown in 2D mode since 3D supports full rotation) */}
      {!is3D && (
        <div className="mt-4 flex justify-center gap-2">
          {["front", "back", "side"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`flex items-center gap-1 rounded-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                view === v
                  ? "bg-plum text-white shadow-sm"
                  : "bg-white border border-plum/10 text-plum hover:bg-blush/45 hover:border-plum/20"
              }`}
            >
              <Eye size={13} />
              {v} View
            </button>
          ))}
        </div>
      )}

      {/* Customization Details Badges */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          customization.neckStyle && `Neck: ${customization.neckStyle}`,
          customization.sleeveStyle && `Sleeves: ${customization.sleeveStyle}`,
          customization.fittingStyle && `Fit: ${customization.fittingStyle}`,
        ]
          .filter(Boolean)
          .map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-bold text-plum shadow-sm border border-plum/5"
            >
              <CheckCircle2 size={13} className="text-gold flex-shrink-0" />
              <span className="truncate">{item}</span>
            </span>
          ))}
      </div>
    </div>
  );
}
