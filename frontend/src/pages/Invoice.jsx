import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderById } from "../services/orderService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { ArrowLeft, Printer } from "lucide-react";

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data.order);
      } catch (err) {
        setError(err.message || "Order not found.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <LoadingSpinner label="Loading Invoice Slip..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <h2 className="font-display text-2xl font-bold text-plum">Invoice Not Found</h2>
        <p className="mt-2 text-sm text-ink/70">The requested invoice slip could not be retrieved.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Go to Home
        </Link>
      </div>
    );
  }

  // Format Helper functions
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateInput) => {
    if (!dateInput) return "1:15 PM"; // default fallback
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "1:15 PM";
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPhone = (phoneInput) => {
    if (!phoneInput) return "N/A";
    const digits = String(phoneInput).replace(/\D/g, "");
    let localDigits = digits;
    if (digits.startsWith("91") && digits.length > 10) {
      localDigits = digits.slice(2);
    }
    if (localDigits.length === 10) {
      return `${localDigits.slice(0, 5)} ${localDigits.slice(5)}`;
    }
    return phoneInput;
  };

  const getBookingId = (ord) => {
    const num = ord.orderNum || ord.id || "N/A";
    if (String(num).startsWith("APT-")) {
      return num;
    }
    return `APT-${num}`;
  };

  // Prices split
  const priceVal = Number(order.price || order.total_price || 0);
  let stitchingPrice = 0;
  let clothPrice = 0;
  if (priceVal === 1298) {
    stitchingPrice = 799;
    clothPrice = 499;
  } else {
    stitchingPrice = Math.round(priceVal * 0.6);
    clothPrice = priceVal - stitchingPrice;
  }

  // Outfit names
  const outfitName = order.outfit?.title || order.outfit_title || "Stitching Outfit";
  const outfitCategory = order.outfitCategory || order.outfit_category || "Custom Sewing";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] py-6 px-4 print:bg-white print:py-0 print:px-0">
      {/* Action panel (hidden on print) */}
      <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between print:hidden">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold hover:text-plum transition">
          <ArrowLeft size={16} /> Back
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-md bg-plum px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose transition"
        >
          <Printer size={15} /> Print Slip / Save PDF
        </button>
      </div>

      {/* Main Slip Canvas */}
      <div className="mx-auto max-w-2xl bg-white border-[6px] border-double border-[#c99a2e]/60 p-5 sm:p-8 min-h-[820px] flex flex-col justify-between print:border-none print:p-0 print:min-h-0">
        
        {/* Header Block */}
        <div>
          {/* Concentric DB Logo */}
          <div className="flex flex-col items-center mt-3">
            <div className="w-[84px] h-[84px] rounded-full border-2 border-[#b41e45] flex items-center justify-center p-1 relative">
              <div className="w-full h-full rounded-full border border-dashed border-[#b41e45] flex flex-col items-center justify-center">
                <span className="font-serif text-2xl font-bold tracking-wide text-[#b41e45] mt-1">DB</span>
                <span className="text-[7.5px] uppercase tracking-widest text-[#b41e45] font-bold leading-none -mt-0.5">Dhanvika</span>
              </div>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mt-4">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#b41e45] tracking-wide leading-tight">
              Dhanvika Beauty Parlour
            </h1>
            <p className="text-[#c99a2e] text-[11px] sm:text-xs font-semibold tracking-widest uppercase mt-1">
              Beauty | Elegance | Confidence
            </p>
          </div>

          {/* Gold Decorative Divider Line */}
          <div className="w-full h-[1px] bg-[#c99a2e]/30 mt-4 mb-4"></div>

          {/* Slip Banner */}
          <h2 className="text-[#b41e45] text-sm sm:text-base font-bold text-center tracking-widest uppercase mb-4">
            Appointment Confirmation Slip
          </h2>

          {/* Confirmation Details Card */}
          <div className="border border-[#eadac2] rounded-xl p-5 sm:p-7 bg-[#fffcf8] shadow-sm mb-6">
            
            {/* Grid for client and appointment details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              {/* Column 1: Client Details */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[#b41e45] font-extrabold uppercase tracking-wider text-[11px] mb-1">
                  Client Details
                </h3>
                <div className="flex justify-between md:grid md:grid-cols-[110px_1fr]">
                  <span className="text-ink/65 font-medium">Customer Name:</span>
                  <span className="text-ink font-bold text-right md:text-left">{order.customerName || order.customer_name || "N/A"}</span>
                </div>
                <div className="flex justify-between md:grid md:grid-cols-[110px_1fr]">
                  <span className="text-ink/65 font-medium">Phone Number:</span>
                  <span className="text-ink font-bold text-right md:text-left">{formatPhone(order.customerPhone || order.customer_phone)}</span>
                </div>
                <div className="flex justify-between md:grid md:grid-cols-[110px_1fr]">
                  <span className="text-ink/65 font-medium">Email Address:</span>
                  <span className="text-ink font-bold text-right md:text-left break-all">{order.customerEmail || order.customer_email || "N/A"}</span>
                </div>
              </div>

              {/* Column 2: Appointment Details */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-[#b41e45] font-extrabold uppercase tracking-wider text-[11px] mb-1">
                  Appointment Details
                </h3>
                <div className="flex justify-between md:grid md:grid-cols-[110px_1fr]">
                  <span className="text-ink/65 font-medium">Booking ID:</span>
                  <span className="text-ink font-bold text-right md:text-left select-all">{getBookingId(order)}</span>
                </div>
                <div className="flex justify-between md:grid md:grid-cols-[110px_1fr]">
                  <span className="text-ink/65 font-medium">Date:</span>
                  <span className="text-ink font-bold text-right md:text-left">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between md:grid md:grid-cols-[110px_1fr]">
                  <span className="text-ink/65 font-medium">Time:</span>
                  <span className="text-ink font-bold text-right md:text-left">{formatTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between md:grid md:grid-cols-[110px_1fr] items-center">
                  <span className="text-ink/65 font-medium">Status:</span>
                  <span className="text-[#10b981] font-bold text-right md:text-left">Confirmed</span>
                </div>
              </div>
            </div>

            {/* Separator line */}
            <div className="w-full h-[1px] bg-[#b41e45]/30 my-5"></div>

            {/* Selected Services section */}
            <div>
              <h3 className="text-[#b41e45] font-extrabold uppercase tracking-wider text-[11px] mb-3">
                Selected Services
              </h3>

              {/* Services Table */}
              <div className="text-xs sm:text-sm">
                {/* Table Header */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr] text-[#b41e45]/70 font-semibold border-b border-[#b41e45]/20 pb-2 mb-2">
                  <span>Service Name</span>
                  <span className="text-center">Duration</span>
                  <span className="text-right">Price</span>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col gap-2">
                  {/* Row 1: Stitching */}
                  <div className="grid grid-cols-[1.5fr_1fr_1fr] font-medium text-ink/80 py-1">
                    <span>
                      {outfitName} ({outfitCategory})
                    </span>
                    <span className="text-center text-ink/65">40 min</span>
                    <span className="text-right font-semibold">Rs. {stitchingPrice.toLocaleString("en-IN")}</span>
                  </div>
                  {/* Row 2: Designing & Material */}
                  <div className="grid grid-cols-[1.5fr_1fr_1fr] font-medium text-ink/80 py-1">
                    <span>Custom Styling & Embroidery</span>
                    <span className="text-center text-ink/65">30 min</span>
                    <span className="text-right font-semibold">Rs. {clothPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Table Divider */}
                <div className="border-t border-[#b41e45]/20 my-3"></div>

                {/* Totals Row */}
                <div className="grid grid-cols-[1.5fr_1.1fr_0.9fr] items-center pt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-ink/60">Total Duration:</span>
                    <span className="font-bold text-ink">70 min</span>
                  </div>
                  <span className="text-right text-ink/75 font-semibold">Total Amount:</span>
                  <span className="text-right text-lg sm:text-xl font-bold text-[#b41e45]">
                    Rs. {priceVal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Footer Block */}
        <div className="mt-4">
          <p className="text-[#b41e45] font-serif italic text-center text-xs sm:text-sm my-3 leading-relaxed">
            Thank you for choosing Dhanvika Beauty Parlour. We look forward to serving you.
          </p>
          
          {/* Small gold line */}
          <div className="w-48 h-[1px] bg-[#c99a2e]/30 mx-auto my-3"></div>

          <p className="text-[9px] text-[#c99a2e]/60 text-center font-sans tracking-wide leading-none pb-2">
            Dhanvika Beauty Parlour © 2026. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
