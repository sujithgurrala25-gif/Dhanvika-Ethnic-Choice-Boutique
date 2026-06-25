import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import logo from "../assets/logo.jpg";

export default function Footer() {
  return (
    <footer className="border-t border-white/70 bg-plum text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img
              src={logo}
              alt="Dhanvika Ethnic Choice Boutique"
              className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-white/30"
            />
            <div>
              <p className="font-display text-2xl font-bold">Dhanvika Ethnic Choice Boutique</p>
              <p className="text-sm text-white/70">Custom stitching with elegant finishing.</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/72">
            Premium blouse, kurti, long frock, and lehenga stitching with personalized measurements,
            modern patterns, and simple order tracking.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">Studio</p>
          <div className="grid gap-3 text-sm text-white/75">
            <a
              href="https://maps.app.goo.gl/8Lkax5woYKuXiJBk6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <MapPin size={16} /> Kailash Hills, Gajularamaram, Hyderabad-500055
            </a>
            <span className="flex items-center gap-2">
              <Phone size={16} /> +91 83413 03000
            </span>
            <span className="flex items-center gap-2">
              <Mail size={16} /> niroopareddy.keesari@gmail.com
            </span>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">Links</p>
          <div className="grid gap-2 text-sm text-white/75">
            <a
              href="https://www.instagram.com/dhanvikaboutique?igsh=b202NDZnZ2ppc2Nj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <Instagram size={16} /> @dhanvikaboutique
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
