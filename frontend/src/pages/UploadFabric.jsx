import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ImagePlus, Upload } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { sampleFabrics } from "../utils/data.js";
import { getDraft, saveDraft } from "../utils/storage.js";
import { compressImage } from "../utils/image.js";

export default function UploadFabric() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const draft = useMemo(() => getDraft(user.id), [user.id]);
  const [fabricImage, setFabricImage] = useState(draft.fabricImage || "");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  if (!draft.selectedOutfit) {
    return (
      <section className="page-shell">
        <EmptyState
          title="No outfit selected"
          message="Start with an outfit category so the fabric can be attached to the right stitching order."
          actionLabel="Select Outfit"
          actionTo="/select-outfit"
        />
      </section>
    );
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result);
        setFabricImage(compressed);
        setFileName(file.name);
        setError("");
      } catch (err) {
        console.error("Compression error:", err);
        setFabricImage(reader.result);
        setFileName(file.name);
        setError("");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSample(image) {
    setFabricImage(image);
    setFileName("Sample fabric");
    setError("");
  }

  function handleNext() {
    if (!fabricImage) {
      setError("Please upload or choose a fabric image.");
      return;
    }
    saveDraft(user.id, { fabricImage });
    navigate("/measurements");
  }

  return (
    <section className="page-shell">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">Upload Fabric</p>
          <h1 className="section-title">Add your cloth image</h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink/68">
            Upload silk cloth, saree design, cotton print, or embroidery fabric for the preview.
          </p>
        </div>
        <Link to="/select-outfit" className="btn-secondary">
          Change Outfit
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-rose/30 bg-white px-6 py-10 text-center transition hover:border-rose hover:bg-blush/35">
            <ImagePlus className="mb-4 text-rose" size={38} />
            <span className="font-display text-2xl font-bold text-plum">Upload Image</span>
            <span className="mt-2 text-sm text-ink/58">PNG, JPG, or JPEG fabric photo</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
          </label>

          {fileName && <p className="mt-4 rounded-md bg-lavender/50 px-4 py-3 text-sm font-semibold text-plum">{fileName}</p>}
          {error && <p className="mt-4 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{error}</p>}

          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-plum">Sample fabrics</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {sampleFabrics.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSample(item.image)}
                  className="overflow-hidden rounded-lg border border-plum/10 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gold"
                >
                  <img src={item.image} alt={item.name} className="h-24 w-full object-cover" />
                  <span className="block px-3 py-2 text-xs font-bold text-plum">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          {fabricImage ? (
            <img src={fabricImage} alt="Fabric preview" className="h-[420px] w-full object-cover" />
          ) : (
            <div className="grid h-[420px] place-items-center bg-white text-center">
              <div>
                <Upload className="mx-auto mb-4 text-gold" size={42} />
                <p className="font-display text-2xl font-bold text-plum">Fabric Preview</p>
                <p className="mt-2 text-sm text-ink/58">Your selected image appears here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={handleNext} className="btn-primary">
          Next
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
