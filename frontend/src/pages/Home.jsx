import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";
import { boutiqueImages } from "../assets/images.js";
import {
  defaultFeedback,
  outfitOptions,
  trendingDesigns,
} from "../utils/data.js";
import { fetchFeedback } from "../services/feedbackService.js";
import { fetchProducts } from "../services/productService.js";
import { fetchTrendingDesigns } from "../services/trendingDesignService.js";

function buildOutfitCards(products) {
  const byCategory = new Map();

  products.forEach((product) => {
    const category = product.category || product.outfit_type || product.name;
    if (!category || byCategory.has(category)) return;

    const fallback = outfitOptions.find(
      (item) => item.title.toLowerCase() === String(category).toLowerCase(),
    );

    byCategory.set(category, {
      id: product.id,
      title: category,
      image: product.image_url || product.image || fallback?.image,
      description: product.description || fallback?.description || "",
      basePrice: product.price || fallback?.basePrice,
    });
  });

  return Array.from(byCategory.values()).filter((item) => item.image);
}

function buildTrendingCards(designs) {
  return designs
    .map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image_url || item.image,
      description: item.description || "",
    }))
    .filter((item) => item.title && item.image)
    .slice(0, 3);
}

export default function Home() {
  const [outfitCards, setOutfitCards] = useState(outfitOptions);
  const [designCards, setDesignCards] = useState(trendingDesigns);
  const [feedbackCards, setFeedbackCards] = useState(
    [...defaultFeedback].slice(0, 6),
  );

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        const firebaseOutfits = buildOutfitCards(data.products || []);
        if (firebaseOutfits.length) {
          setOutfitCards(firebaseOutfits.slice(0, 4));
        }
      })
      .catch((error) => {
        console.error("Home products load error:", error);
      });

    fetchTrendingDesigns()
      .then((data) => {
        const firebaseDesigns = buildTrendingCards(data.designs || []);
        if (firebaseDesigns.length) {
          setDesignCards(firebaseDesigns);
        }
      })
      .catch((error) => {
        console.error("Home trending designs load error:", error);
      });

    fetchFeedback()
      .then((data) => {
        const feedback = data.feedback || [];
        const combined = [...feedback];
        for (const df of defaultFeedback) {
          if (
            !combined.some(
              (item) => item.id === df.id || item.message === df.message,
            )
          ) {
            combined.push(df);
          }
        }
        setFeedbackCards(combined.slice(0, 6));
      })
      .catch(() => {
        // Keep default feedback on error
      });
  }, []);

  return (
    <>
      <section
        className="relative min-h-[74vh] overflow-hidden bg-plum"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(43, 38, 48, 0.82), rgba(81, 50, 82, 0.45), rgba(255, 248, 237, 0.12)), url(${boutiqueImages.hero})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="page-shell flex min-h-[74vh] items-center">
          <div className="max-w-3xl animate-fadeUp py-16 text-white">
            <p className="mb-4 inline-flex rounded-md bg-white/14 px-4 py-2 text-sm font-bold text-gold backdrop-blur">
              Premium custom stitching studio
            </p>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              Dhanvika Ethnic Choice Boutique
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/86">
              Custom stitched outfits with personalized measurements and modern
              designs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/select-outfit"
                className="btn-primary bg-gold text-plum hover:bg-white"
              >
                <Sparkles size={18} />
                Start Designing
              </Link>
              <Link
                to="/gallery"
                className="btn-secondary border-white/70 bg-white/95"
              >
                <CalendarCheck size={18} />
                Explore Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr]">
        <div className="overflow-hidden rounded-lg shadow-aura">
          <img
            src={boutiqueImages.intro}
            alt="Boutique clothing studio"
            className="h-full min-h-[360px] w-full object-cover"
          />
        </div>
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">
            Boutique Intro
          </p>
          <h2 className="section-title">
            Design, measure, preview, and order in one calm flow.
          </h2>
          <p className="mt-4 leading-7 text-ink/70">
            Dhanvika Ethnic Choice Boutique brings custom tailoring into a clean
            online experience. Choose the outfit, upload your fabric, enter
            measurements, customize style details, and track every order from
            received to delivered.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Custom Fit", "Fabric Preview", "Order Tracking"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white bg-white p-4 text-center shadow-sm"
              >
                <Scissors className="mx-auto mb-2 text-rose" size={20} />
                <p className="text-sm font-bold text-plum">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/70">
        <div className="page-shell">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase text-gold">
                Categories
              </p>
              <h2 className="section-title">Choose your outfit</h2>
            </div>
            <Link to="/select-outfit" className="btn-secondary">
              View All
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {outfitCards.map((item) => (
              <Link
                key={item.id}
                to="/select-outfit"
                className="card group overflow-hidden transition hover:-translate-y-1"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="p-5">
                  <h3 className="font-display text-2xl font-bold text-plum">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="mb-7">
          <p className="mb-3 text-sm font-bold uppercase text-gold">
            Trending Designs
          </p>
          <h2 className="section-title">Fresh patterns for modern occasions</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {designCards.map((item) => (
            <article
              key={item.id || item.title}
              className="card overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold text-plum">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-lavender/45">
        <div className="page-shell">
          <div className="mb-7">
            <p className="mb-3 text-sm font-bold uppercase text-gold">
              Testimonials
            </p>
            <h2 className="section-title">Customer feedback</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {feedbackCards.map((item, i) => (
              <article key={item.id || i} className="card p-5">
                <div className="mb-4 flex gap-1 text-gold">
                  {Array.from({ length: Number(item.rating) || 5 }).map(
                    (_, index) => (
                      <Star key={index} size={18} fill="currentColor" />
                    ),
                  )}
                </div>
                <p className="text-sm leading-6 text-ink/72">
                  "{item.message}"
                </p>
                <div className="mt-5 border-t border-plum/10 pt-4">
                  <p className="font-bold text-plum">
                    {item.name || "Customer"}
                  </p>
                  <p className="text-xs font-bold uppercase text-rose">
                    {item.outfit_type || item.outfitType}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
