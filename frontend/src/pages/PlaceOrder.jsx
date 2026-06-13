import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";
import DressPreview from "../components/DressPreview.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { estimatePrice, formatPrice } from "../utils/pricing.js";
import { clearDraft, getDraft } from "../utils/storage.js";
import { createOrder } from "../services/orderService.js";

export default function PlaceOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const draft = useMemo(() => getDraft(user.id), [user.id]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const price = estimatePrice(draft.selectedOutfit?.id, draft.customization);
  const orderDate = new Date();

  if (!draft.selectedOutfit || !draft.measurements || !draft.customization) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Order details are incomplete"
          message="Complete the design flow before confirming your stitching order."
          actionLabel="Start Designing"
          actionTo="/select-outfit"
        />
      </section>
    );
  }

  async function handleConfirm() {
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPhoneError("");
    setError("");
    setLoading(true);

    try {
      const payload = {
        outfit_type: draft.selectedOutfit.id,
        outfit_title: draft.selectedOutfit.title,
        outfit_category: draft.selectedOutfit.title,
        total_price: price,
        neck_style: draft.customization.neckStyle,
        sleeve_style: draft.customization.sleeveStyle,
        fitting: draft.customization.fittingStyle,
        extras: draft.customization.extras || [],
        measurements: draft.measurements,
        fabric_image: draft.fabricImage || null,
        ai_preview_image: draft.aiPreviewImage || null,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: digits.length === 10 ? `91${digits}` : digits,
        unit: draft.unit || "Inches",
      };

      const data = await createOrder(payload);
      clearDraft(user.id);
      setSuccessOrder(data.order);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Place Order</p>
        <h1 className="section-title">Final order confirmation</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <DressPreview outfit={draft.selectedOutfit} fabricImage={draft.fabricImage} customization={draft.customization} aiPreviewImage={draft.aiPreviewImage} compact />

        <div className="card p-5">
          <h2 className="font-display text-2xl font-bold text-plum">Order Details</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <Detail label="Outfit Type" value={draft.selectedOutfit.title} />
            <Detail label="Neck Style" value={draft.customization.neckStyle} />
            <Detail label="Sleeve Style" value={draft.customization.sleeveStyle} />
            <Detail label="Fitting Type" value={draft.customization.fittingStyle} />
            <Detail label="Extra Options" value={(draft.customization.extras || []).join(", ") || "None"} />
            <Detail label="Estimated Price" value={formatPrice(price)} />
            <Detail label="Order Date" value={orderDate.toLocaleDateString()} />
          </div>

          <div className="mt-5 rounded-lg bg-cream p-4">
            <p className="mb-3 text-sm font-bold text-plum">Measurements</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(draft.measurements).map(([key, value]) => (
                <span key={key} className="rounded-md bg-white px-3 py-2 text-xs font-bold text-plum">
                  {key}: {value} {draft.unit}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="grid gap-2 text-sm font-bold text-plum">
              <span className="flex items-center gap-2">
                <Phone size={15} />
                WhatsApp Mobile Number
              </span>
              <input
                className="input-field"
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setPhoneError("");
                }}
                placeholder="e.g. 9876543210"
                required
                maxLength={15}
              />
            </label>
            {phoneError && (
              <p className="mt-2 rounded-md bg-rose/10 px-4 py-2 text-xs font-semibold text-rose">
                {phoneError}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-md bg-rose/10 px-4 py-2 text-xs font-semibold text-rose">
              {error}
            </p>
          )}

          <div className="mt-6">
            <button type="button" onClick={handleConfirm} className="btn-primary w-full" disabled={loading}>
              {loading ? <LoadingSpinner label="Confirming" /> : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>

      {successOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-plum/45 px-4 backdrop-blur-sm">
          <div className="card max-w-md p-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-gold" size={54} />
            <h2 className="font-display text-3xl font-bold text-plum">Order Confirmed</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">
              Your order ID is <span className="font-bold text-plum">{successOrder.id}</span>.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/order-output/${successOrder.id}`)}
              className="btn-primary mt-6 w-full"
            >
              View Final Output
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-cream px-4 py-3">
      <span className="font-semibold text-ink/60">{label}</span>
      <span className="text-right font-bold text-plum">{value}</span>
    </div>
  );
}
