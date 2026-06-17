import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Clock,
  Scissors,
  Sparkles,
  Star,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { boutiqueImages } from "../assets/images.js";
import designerSketchbook from "../assets/designer_sketchbook.png";
import {
  defaultFeedback,
  outfitOptions,
  trendingDesigns,
} from "../utils/data.js";
import { fetchFeedback } from "../services/feedbackService.js";
import { fetchProducts } from "../services/productService.js";
import { fetchTrendingDesigns } from "../services/trendingDesignService.js";
import { useAuth } from "../context/AuthContext.jsx";

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
      title: product.name || category,
      category: category,
      image: product.image || product.image_url || fallback?.image,
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
  const { user } = useAuth();
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
      <section className="relative min-h-[74vh] overflow-hidden bg-cream py-12 lg:py-20">
        <div className="page-shell grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center animate-fadeUp">
            {/* Logo/Badge */}
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center border-2 border-gold rounded-md">
                <span className="font-display text-2xl font-bold text-plum">D</span>
              </div>
              <div>
                <span className="block font-display text-lg font-bold tracking-wide text-plum leading-none">
                  DHANVIKA
                </span>
                <span className="block text-[10px] font-extrabold tracking-widest text-gold uppercase mt-1">
                  Ethnic Choice Boutique
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">
              CUSTOM STITCHED
            </p>

            {/* Title */}
            <h1 className="font-display text-5xl font-bold leading-tight text-plum sm:text-6xl lg:text-7xl">
              Elegance, <span className="italic font-display font-medium">Just For You</span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/75">
              Bespoke ethnic wear designed with love, crafted to perfection for every occasion.
            </p>

            {/* Buttons */}
            {!user || user.role !== "admin" ? (
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap">
                <Link
                  to="/gallery"
                  className="btn-gallery-admin inline-flex items-center justify-center gap-3 rounded-xl px-7 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-4 focus:ring-rose/20 group w-full sm:w-fit"
                >
                  <Sparkles size={20} className="text-gold animate-pulse group-hover:scale-125 transition-transform duration-300" />
                  <span>Explore Gallery</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                <Link
                  to="/select-outfit"
                  className="btn-gallery-admin inline-flex items-center justify-center gap-3 rounded-xl px-7 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-4 focus:ring-rose/20 group w-full sm:w-fit"
                >
                  <Scissors size={20} className="text-gold group-hover:rotate-12 transition-transform duration-300" />
                  <span>Custom Stitching</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                <Link
                  to="/user-dashboard?tab=browse"
                  className="btn-gallery-admin inline-flex items-center justify-center gap-3 rounded-xl px-7 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-4 focus:ring-rose/20 group w-full sm:w-fit"
                >
                  <ShoppingBag size={20} className="text-gold group-hover:scale-125 transition-transform duration-300" />
                  <span>Boutique Products</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap">
                <Link
                  to="/gallery"
                  className="btn-gallery-admin inline-flex items-center justify-center gap-3 rounded-xl px-7 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-4 focus:ring-rose/20 group w-full sm:w-fit"
                >
                  <Sparkles size={20} className="text-gold animate-pulse group-hover:scale-125 transition-transform duration-300" />
                  <span>Explore Gallery</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
            )}

            {/* Features Row */}
            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 border-t border-plum/10 pt-8">
              {[
                {
                  icon: Scissors,
                  title: "CUSTOM FIT",
                  desc: "Tailored for you",
                },
                {
                  icon: Sparkles,
                  title: "PREMIUM FABRICS",
                  desc: "Quality you deserve",
                },
                {
                  icon: Award,
                  title: "EXPERT TAILORING",
                  desc: "Perfection in every stitch",
                },
                {
                  icon: Clock,
                  title: "TIMELY DELIVERY",
                  desc: "On time, every time",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <Icon size={20} className="text-gold" />
                    <h3 className="text-xs font-bold tracking-wider text-plum uppercase mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-ink/60">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="relative animate-fadeUp">
            <div className="overflow-hidden rounded-2xl shadow-aura border-4 border-white/60">
              <img
                src={designerSketchbook}
                alt="Fashion designer sketchbook with lehenga drawing"
                className="w-full h-auto object-cover max-h-[580px] rounded-xl"
              />
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Custom Fit", "Fabric Preview"].map((item) => (
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
