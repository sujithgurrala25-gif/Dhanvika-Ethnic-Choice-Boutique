import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, MessageCircle, Upload } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";
import { boutiqueImages } from "../assets/images.js";
import {
  measurementFieldsByOutfit,
  neckStyles,
  sleeveStyles,
  fittingOptions,
} from "../utils/data.js";
import { createOrder } from "../services/orderService.js";
import { buildWhatsAppOrderLink } from "../utils/whatsapp.js";
import { generateInvoicePDF } from "../utils/pdfGenerator.js";
import { compressImage } from "../utils/image.js";

const subCategoriesMap = {
  Blouse: ["Bridal Blouse", "Maggam Work Blouse", "Boat Neck Blouse", "Designer Blouse"],
  Kurti: ["Short Kurti", "Long Kurti", "A-Line Kurti", "Anarkali Kurti"],
  "Long Frock": ["Party Wear Frock", "Anarkali Frock", "Layered Frock", "Gown Style Frock"],
  Lehenga: ["Bridal Lehenga", "A-Line Lehenga", "Designer Lehenga", "Party Wear Lehenga"],
};

const subCategoryPriceMap = {
  "Bridal Blouse": 4500,
  "Maggam Work Blouse": 3500,
  "Boat Neck Blouse": 1500,
  "Designer Blouse": 2500,
  "Short Kurti": 1200,
  "Long Kurti": 1800,
  "A-Line Kurti": 2000,
  "Anarkali Kurti": 2800,
  "Party Wear Frock": 3500,
  "Anarkali Frock": 4000,
  "Layered Frock": 3800,
  "Gown Style Frock": 5000,
  "Bridal Lehenga": 15000,
  "A-Line Lehenga": 7000,
  "Designer Lehenga": 10000,
  "Party Wear Lehenga": 8000,
};

const emptyOfflineForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  outfitTitle: "",
  outfitCategory: "Blouse",
  subCategory: "Bridal Blouse",
  price: 4500,
  fabricImage: "",
  neckStyle: "Boat Neck",
  sleeveStyle: "Short Sleeve",
  fittingStyle: "Regular Fit",
  deliveryDate: "",
  orderDate: "",
  description: "",
};

export default function AddOfflineOrder() {
  const navigate = useNavigate();
  const [offlineForm, setOfflineForm] = useState({
    ...emptyOfflineForm,
    orderDate: new Date().toISOString().split("T")[0],
  });
  const [offlineMeasurements, setOfflineMeasurements] = useState({});
  const [offlineUnit, setOfflineUnit] = useState("Inches");
  const [showOfflineMeasurements, setShowOfflineMeasurements] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result);
        setOfflineForm((prev) => ({
          ...prev,
          fabricImage: compressed,
        }));
      } catch (err) {
        console.error("Compression error:", err);
        setOfflineForm((prev) => ({
          ...prev,
          fabricImage: reader.result,
        }));
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      alert("Failed to read image file.");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const offlineOutfitKey = offlineForm.outfitCategory.toLowerCase().replace(" ", "-");
  const offlineFields = measurementFieldsByOutfit[offlineOutfitKey] || [];

  function handleOfflineChange(event) {
    const { name, value } = event.target;
    if (name === "outfitCategory") {
      const subs = subCategoriesMap[value] || [];
      const firstSub = subs[0] || "";
      setOfflineForm({
        ...offlineForm,
        outfitCategory: value,
        subCategory: firstSub,
        price: subCategoryPriceMap[firstSub] || "",
      });
    } else if (name === "subCategory") {
      setOfflineForm({
        ...offlineForm,
        subCategory: value,
        price: subCategoryPriceMap[value] || "",
      });
    } else {
      setOfflineForm({ ...offlineForm, [name]: value });
    }
  }

  function resetOfflineForm() {
    setOfflineForm({
      ...emptyOfflineForm,
      orderDate: new Date().toISOString().split("T")[0],
    });
    setOfflineMeasurements({});
    setOfflineUnit("Inches");
    setShowOfflineMeasurements(false);
  }

  async function handleOfflineSubmit(event) {
    event.preventDefault();
    setWhatsAppStatus(null);
    setIsSubmitting(true);

    const digits = offlineForm.customerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setWhatsAppStatus({
        type: "error",
        message: "Please enter a valid 10-digit customer mobile number.",
      });
      setIsSubmitting(false);
      return;
    }

    if (!offlineForm.orderDate) {
      setWhatsAppStatus({
        type: "error",
        message: "Please select the date of order.",
      });
      setIsSubmitting(false);
      return;
    }

    if (!offlineForm.deliveryDate) {
      setWhatsAppStatus({
        type: "error",
        message: "Please select a preferred delivery date.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formattedPhone = digits.length === 10 ? `91${digits}` : digits;
      const payload = {
        outfit_type: offlineForm.outfitCategory,
        outfit_title: offlineForm.outfitTitle.trim() || `${offlineForm.subCategory || offlineForm.outfitCategory} - Custom`,
        outfit_category: offlineForm.outfitCategory,
        sub_category: offlineForm.subCategory,
        total_price: Number(offlineForm.price) || 0,
        neck_style: offlineForm.neckStyle,
        sleeve_style: offlineForm.sleeveStyle,
        fitting: offlineForm.fittingStyle,
        fabric_image: offlineForm.fabricImage.trim() || boutiqueImages.intro,
        customer_name: offlineForm.customerName.trim(),
        customer_email: offlineForm.customerEmail.trim(),
        customer_phone: formattedPhone,
        deliveryDate: offlineForm.deliveryDate,
        createdAt: new Date(offlineForm.orderDate).toISOString(),
        description: offlineForm.description.trim(),
        ...(showOfflineMeasurements ? {
          measurements: offlineMeasurements,
          unit: offlineUnit,
        } : {}),
      };

      const data = await createOrder(payload);
      const newOrder = data.order;

      // Reconstruct the shape WhatsApp util expects
      const orderForWA = {
        ...newOrder,
        outfit: { title: newOrder.outfit?.title || payload.outfit_title },
        fabricImage: payload.fabric_image,
        customerName: payload.customer_name,
        customerPhone: payload.customer_phone,
        customization: newOrder.customization,
        price: payload.total_price,
        measurements: newOrder.measurements,
        unit: newOrder.unit,
        deliveryDate: payload.deliveryDate,
        description: payload.description,
      };

      resetOfflineForm();

      try {
        generateInvoicePDF(orderForWA);
        const waLink = buildWhatsAppOrderLink(orderForWA);
        window.open(waLink, "_blank", "noopener,noreferrer");
        setWhatsAppStatus({
          type: "success",
          message: "Order saved successfully. Click below to open WhatsApp if it did not open automatically.",
          link: waLink,
        });
      } catch (waErr) {
        setWhatsAppStatus({
          type: "success",
          message: `Order saved successfully. (WhatsApp Error: ${waErr.message})`,
        });
      }
    } catch (err) {
      setWhatsAppStatus({ type: "error", message: err.message || "Failed to save order." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin-dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:text-plum transition mb-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="section-title">Add Offline Customer Order</h1>
          <p className="mt-2 text-sm text-ink/60">
            Create an offline stitching or boutique order and automatically generate WhatsApp notification details.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {whatsAppStatus && (
          <div
            className={`mb-6 rounded-lg px-4 py-3.5 text-sm font-semibold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm ${
              whatsAppStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-rose/10 border border-rose/20 text-rose"
            }`}
          >
            <p className="flex-1">{whatsAppStatus.message}</p>
            <div className="flex items-center gap-3">
              {whatsAppStatus.link && (
                <a
                  href={whatsAppStatus.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-1.5 px-3 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <MessageCircle size={14} /> Open WhatsApp Chat
                </a>
              )}
              <button
                type="button"
                onClick={() => setWhatsAppStatus(null)}
                className="text-xs font-bold uppercase tracking-wider opacity-75 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleOfflineSubmit} className="card p-6 sm:p-8 space-y-6">
          {/* Section 1: Customer Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold border-b border-plum/10 pb-2 mb-4">
              1. Customer Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-plum">
                Customer Name *
                <input
                  className="input-field"
                  name="customerName"
                  value={offlineForm.customerName}
                  onChange={handleOfflineChange}
                  placeholder="e.g. Priyal Sharma"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum">
                WhatsApp Mobile Number *
                <input
                  className="input-field"
                  name="customerPhone"
                  value={offlineForm.customerPhone}
                  onChange={handleOfflineChange}
                  placeholder="e.g. 9876543210"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum md:col-span-2">
                Email Address (Optional)
                <input
                  className="input-field"
                  type="email"
                  name="customerEmail"
                  value={offlineForm.customerEmail}
                  onChange={handleOfflineChange}
                  placeholder="e.g. priyal@example.com"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Order Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold border-b border-plum/10 pb-2 mb-4">
              2. Order & Pricing Details
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-plum">
                Date of Order *
                <input
                  className="input-field"
                  type="date"
                  name="orderDate"
                  value={offlineForm.orderDate || ""}
                  onChange={handleOfflineChange}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum">
                Preferred Delivery Date *
                <input
                  className="input-field"
                  type="date"
                  name="deliveryDate"
                  value={offlineForm.deliveryDate || ""}
                  onChange={handleOfflineChange}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Outfit Category *
                <select
                  className="input-field"
                  name="outfitCategory"
                  value={offlineForm.outfitCategory}
                  onChange={handleOfflineChange}
                >
                  {["Blouse", "Kurti", "Long Frock", "Lehenga"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum">
                Sub Category *
                <select
                  className="input-field"
                  name="subCategory"
                  value={offlineForm.subCategory}
                  onChange={handleOfflineChange}
                >
                  {(subCategoriesMap[offlineForm.outfitCategory] || []).map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Outfit Title (Optional)
                <input
                  className="input-field"
                  name="outfitTitle"
                  value={offlineForm.outfitTitle}
                  onChange={handleOfflineChange}
                  placeholder="e.g. Wedding Silk Blouse"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum">
                Stitching Price (Rs.) *
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  name="price"
                  value={offlineForm.price}
                  onChange={handleOfflineChange}
                  required
                />
              </label>
            </div>
          </div>

          {/* Section 3: Styles & Fabric */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold border-b border-plum/10 pb-2 mb-4">
              3. Style & Fabric Customization
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold text-plum">
                Neck Style
                <select
                  className="input-field"
                  name="neckStyle"
                  value={offlineForm.neckStyle}
                  onChange={handleOfflineChange}
                >
                  {neckStyles.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum">
                Sleeve Style
                <select
                  className="input-field"
                  name="sleeveStyle"
                  value={offlineForm.sleeveStyle}
                  onChange={handleOfflineChange}
                >
                  {sleeveStyles.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum">
                Fitting Preference
                <select
                  className="input-field"
                  name="fittingStyle"
                  value={offlineForm.fittingStyle}
                  onChange={handleOfflineChange}
                >
                  {fittingOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2 text-sm font-bold text-plum md:col-span-3">
                <span>Fabric Image (Optional)</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    className="input-field flex-grow"
                    name="fabricImage"
                    value={offlineForm.fabricImage}
                    onChange={handleOfflineChange}
                    placeholder="https://example.com/fabric-image.jpg"
                  />
                  <label className="btn-secondary py-3 px-4 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-w-[150px]">
                    {uploadingImage ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-plum border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {offlineForm.fabricImage && (
                  <div className="mt-3 flex items-center gap-4 animate-in fade-in duration-200">
                    <img
                      src={offlineForm.fabricImage}
                      alt="Fabric Preview"
                      className="h-16 w-16 rounded-md object-cover border border-plum/10 shadow-aura"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setOfflineForm((prev) => ({ ...prev, fabricImage: "" }))}
                      className="text-xs font-bold uppercase tracking-wider text-rose hover:text-rose/85 transition"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Measurements */}
          <div className="border-t border-plum/10 pt-4">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-plum mb-4">
              <input
                type="checkbox"
                checked={showOfflineMeasurements}
                onChange={(e) => setShowOfflineMeasurements(e.target.checked)}
                className="rounded border-plum/20 text-plum focus:ring-plum h-4 w-4"
              />
              Include Custom Measurements
            </label>

            {showOfflineMeasurements && (
              <div className="grid gap-4 border border-plum/10 rounded-lg bg-cream/40 p-5 sm:p-6 animate-fadeUp">
                <div className="flex items-center justify-between border-b border-plum/5 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-plum/70">
                    Measurements ({offlineUnit})
                  </span>
                  <div className="flex rounded bg-white p-0.5 shadow-sm border border-plum/10">
                    {["Inches", "CM"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setOfflineUnit(item)}
                        className={`rounded px-3 py-1 text-xs font-bold transition ${
                          offlineUnit === item
                            ? "bg-plum text-white shadow-sm"
                            : "text-plum hover:bg-lavender"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {offlineFields.map((field) => (
                    <label key={field.key} className="grid gap-1.5 text-xs font-bold text-plum">
                      {field.name}
                      <input
                        className="input-field py-1.5 text-sm"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder={`in ${offlineUnit}`}
                        value={offlineMeasurements[field.key] || ""}
                        onChange={(e) =>
                          setOfflineMeasurements({
                            ...offlineMeasurements,
                            [field.key]: e.target.value,
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Description */}
          <div className="border-t border-plum/10 pt-4">
            <label className="grid gap-2 text-sm font-bold text-plum">
              Order Description / Notes (Optional)
              <textarea
                className="input-field min-h-24 resize-y"
                name="description"
                value={offlineForm.description}
                onChange={handleOfflineChange}
                placeholder="Add any additional notes, specific tailoring instructions, or design requests here..."
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-plum/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 justify-center py-3 shadow-md"
            >
              <Save size={18} />
              {isSubmitting ? "Saving..." : "Save & Send WhatsApp"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetOfflineForm();
                navigate("/admin-dashboard");
              }}
              className="btn-secondary justify-center py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
