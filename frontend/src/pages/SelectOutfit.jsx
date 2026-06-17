import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    setSelectedCategory(outfit);
  }

  function handleSubDesignSelect(subDesign) {
    const outfitWithSub = {
      ...selectedCategory,
      subDesign: subDesign.title,
      title: `${subDesign.title}`,
      description: subDesign.description,
    };
    saveDraft(user.id, { selectedOutfit: outfitWithSub });
    navigate("/upload-fabric");
  }

  function handleBack() {
    setSelectedCategory(null);
  }

  // Sub-designs view
  if (selectedCategory) {
    return (
      <section className="page-shell">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary mb-5 inline-flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back to Categories
          </button>
          <p className="mb-3 text-sm font-bold uppercase text-gold">
            {selectedCategory.category}
          </p>
          <h1 className="section-title">Choose your {selectedCategory.category.toLowerCase()} style</h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink/68">
            Select a sub-design to continue. Your fabric, measurements, and custom styles will be saved to your current order draft.
          </p>
        </div>

        {/* Parent category banner */}
        <div className="mb-8 flex items-center gap-5 rounded-xl border border-plum/10 bg-white p-4 shadow-sm">
          <img
            src={selectedCategory.image}
            alt={selectedCategory.title}
            className="h-20 w-20 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-display text-xl font-bold text-plum">{selectedCategory.title}</h2>
            <p className="mt-1 text-sm text-ink/60">{selectedCategory.description}</p>
            <p className="mt-1 text-sm font-bold text-gold">From {formatPrice(selectedCategory.basePrice)}</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(selectedCategory.subDesigns || []).map((sub) => (
            <article
              key={sub.id}
              className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-lavender/60 to-cream">
                <div className="flex h-full w-full items-center justify-center">
                  <Sparkles size={36} className="text-plum/30" />
                </div>
                <span className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1.5 text-xs font-bold text-plum shadow-sm">
                  {selectedCategory.category}
                </span>
              </div>
              <div className="p-5">
                <span className="mb-3 inline-grid h-9 w-9 place-items-center rounded-md bg-lavender text-plum">
                  <Sparkles size={17} />
                </span>
                <h3 className="font-display text-xl font-bold text-plum">{sub.title}</h3>
                <p className="mt-2 min-h-[60px] text-sm leading-6 text-ink/65">{sub.description}</p>
                <button
                  type="button"
                  onClick={() => handleSubDesignSelect(sub)}
                  className="btn-primary mt-4 w-full"
                >
                  Select
                  <ArrowRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
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
              <p className="mt-2 text-xs font-semibold text-gold">
                {outfit.subDesigns?.length || 0} sub-designs available
              </p>
              <button type="button" onClick={() => handleCategorySelect(outfit)} className="btn-primary mt-4 w-full">
                View Designs
                <ArrowRight size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
