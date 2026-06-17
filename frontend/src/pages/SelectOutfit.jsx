import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { outfitOptions } from "../utils/data.js";
import { saveDraft } from "../utils/storage.js";
import { formatPrice } from "../utils/pricing.js";
import { fetchProducts } from "../services/productService.js";

function buildFirebaseOutfits(products) {
  return outfitOptions.map((outfit) => {
    const product = products.find(
      (item) =>
        String(item.category || "").toLowerCase() ===
        String(outfit.category || outfit.id || "").toLowerCase(),
    );

    if (!product) return outfit;

    return {
      ...outfit,
      title: product.name || product.category || outfit.title,
      image: product.image || product.image_url || outfit.image,
      basePrice: product.price || outfit.basePrice,
      description: product.description || outfit.description,
      productId: product.id,
      stock: product.stock,
    };
  });
}

export default function SelectOutfit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState(outfitOptions);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setOutfits(buildFirebaseOutfits(data.products || []));
      })
      .catch((error) => {
        console.error("Select outfit products load error:", error);
      });
  }, []);

  function handleCategorySelect(outfit) {
    saveDraft(user.id, { selectedOutfit: outfit });
    navigate("/upload-fabric");
  }

  // Main categories view
  return (
    <section className="page-shell">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Select Outfit</p>
        <h1 className="section-title">What are we stitching today?</h1>
        <p className="mt-4 leading-7 text-ink/68">
          Choose the outfit type first. Your fabric, measurements, and custom styles will be saved to your current order draft.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {outfits.map((outfit) => (
          <article key={outfit.id} className="card group overflow-hidden transition hover:-translate-y-1">
            <div className="relative h-56 overflow-hidden">
              <img src={outfit.image} alt={outfit.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-2 text-xs font-bold text-plum shadow-sm">
                From {formatPrice(outfit.basePrice)}
              </span>
            </div>
            <div className="p-5">
              <span className="mb-3 inline-grid h-10 w-10 place-items-center rounded-md bg-lavender text-plum">
                <Sparkles size={19} />
              </span>
              <h2 className="font-display text-2xl font-bold text-plum">{outfit.title}</h2>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-ink/65">{outfit.description}</p>
              <button type="button" onClick={() => handleCategorySelect(outfit)} className="btn-primary mt-4 w-full">
                Select & Customize
                <ArrowRight size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

