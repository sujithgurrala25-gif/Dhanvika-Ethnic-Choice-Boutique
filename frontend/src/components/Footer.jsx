import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone, Scissors } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/70 bg-plum text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-white/12">
              <Scissors size={20} />
            </span>
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
            <span className="flex items-center gap-2">
              <MapPin size={16} /> Kailash Hills, Gajularamaram, Hyderabad-500055
            </span>
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
            <Link to="/select-outfit" className="hover:text-white">Start Designing</Link>
            <Link to="/previous-orders" className="hover:text-white">Previous Orders</Link>
            <Link to="/feedback" className="hover:text-white">Feedback</Link>
            <span className="flex items-center gap-2 pt-2 text-white/60">
              <Instagram size={16} /> @dhanvika_ethnic_choice
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
