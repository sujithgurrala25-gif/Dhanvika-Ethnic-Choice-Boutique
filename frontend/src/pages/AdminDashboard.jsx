import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LogOut,
  Mail,
  MessageSquareText,
  MessageCircle,
  PackageCheck,
  Phone,
  Plus,
  RefreshCw,
  Save,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react";
import { boutiqueImages } from "../assets/images.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  orderStatusOptions,
  measurementFieldsByOutfit,
  neckStyles,
  sleeveStyles,
  fittingOptions,
} from "../utils/data.js";
import { formatPrice } from "../utils/pricing.js";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../services/orderService.js";
import {
  fetchFeedback,
  deleteFeedback,
  updateFeedback,
} from "../services/feedbackService.js";
import {
  fetchUsers,
} from "../services/userService.js";
import {
  createTrendingDesign,
  deleteTrendingDesign,
  fetchTrendingDesigns,
  updateTrendingDesign,
} from "../services/trendingDesignService.js";
import {
  createProductDesign,
  deleteProductDesign,
  fetchProductDesigns,
  updateProductDesign,
} from "../services/productDesignService.js";
import { buildWhatsAppOrderLink, buildWhatsAppReadyMessage, normalizeWhatsAppPhone } from "../utils/whatsapp.js";
import { generateInvoicePDF } from "../utils/pdfGenerator.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const measurementLabels = {
  bust: "Bust",
  chestRound: "Chest Round",
  underBust: "Under Bust",
  waist: "Waist",
  hip: "Hip",
  shoulder: "Shoulder",
  sleeveLength: "Sleeve Length",
  armRound: "Arm Round",
  armHole: "Arm Hole",
  dressLength: "Dress Length",
  blouseLength: "Blouse Length",
  neckDepth: "Neck Depth",
  sleeveOpening: "Sleeve Opening",
};

const emptyProductForm = {
  name: "",
  category: "Blouse",
  price: "",
  stock: "",
  image: "",
  description: "",
};

const emptyTrendingForm = {
  title: "",
  image: "",
  description: "",
};

const emptyDesignForm = {
  parentProductId: "",
  name: "",
  image: "",
  price: "",
  stock: "",
  description: "",
};

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
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]   = useState([]);
  const [productDesigns, setProductDesigns] = useState([]);
  const [trendingDesigns, setTrendingDesigns] = useState([]);
  const [orders, setOrders]       = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleMeasurements = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };
  const [feedback, setFeedback]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  const customerStats = useMemo(() => {
    return customers.map((customer) => {
      const customerOrders = orders.filter(
        (o) =>
          (o.customer_email || o.user_email)?.toLowerCase() === customer.email?.toLowerCase()
      );

      const latestOrderWithPhone = [...customerOrders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ).find((o) => o.customer_phone || o.customerPhone);

      const phone = customer.phone || (latestOrderWithPhone
        ? (latestOrderWithPhone.customer_phone || latestOrderWithPhone.customerPhone)
        : "");

      const totalSpent = customerOrders.reduce(
        (sum, o) => sum + Number(o.price || o.total_price || 0),
        0
      );

      return {
        ...customer,
        ordersCount: customerOrders.length,
        totalSpent,
        phone,
      };
    });
  }, [customers, orders]);

  const activeOrders    = useMemo(() => orders.filter((o) => o.status !== "Delivered"), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === "Delivered"), [orders]);

  const [form, setForm]             = useState(emptyProductForm);
  const [editingId, setEditingId]   = useState("");
  const [designForm, setDesignForm] = useState(emptyDesignForm);
  const [editingDesignId, setEditingDesignId] = useState("");
  const [trendingForm, setTrendingForm] = useState(emptyTrendingForm);
  const [editingTrendingId, setEditingTrendingId] = useState("");
  const [offlineForm, setOfflineForm] = useState(emptyOfflineForm);
  const [offlineMeasurements, setOfflineMeasurements] = useState({});
  const [offlineUnit, setOfflineUnit] = useState("Inches");
  const [showOfflineMeasurements, setShowOfflineMeasurements] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState(null);

  const offlineOutfitKey = offlineForm.outfitCategory.toLowerCase().replace(" ", "-");
  const offlineFields = measurementFieldsByOutfit[offlineOutfitKey] || [];

  const loadAll = useCallback(async () => {
    try {
      const [prodData, designData, trendData, ordData, fbData, usrData] =
        await Promise.all([
          fetchProducts(),
          fetchProductDesigns(),
          fetchTrendingDesigns(),
          fetchOrders(),
          fetchFeedback(),
          fetchUsers(),
        ]);
      setProducts(prodData.products || []);
      setProductDesigns(designData.designs || []);
      setTrendingDesigns(trendData.designs || []);
      setOrders(ordData.orders || []);
      setFeedback(fbData.feedback || []);
      const rawUsers = usrData.users || [];
      const seenEmails = new Set();
      const uniqueCustomers = [];
      rawUsers.forEach((u) => {
        if (u.role !== "admin" && u.email) {
          const emailLower = u.email.toLowerCase();
          if (!seenEmails.has(emailLower)) {
            seenEmails.add(emailLower);
            uniqueCustomers.push(u);
          }
        }
      });
      setCustomers(uniqueCustomers);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleFormChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm(emptyProductForm);
    setEditingId("");
  }

  function handleDesignChange(event) {
    setDesignForm({
      ...designForm,
      [event.target.name]: event.target.value,
    });
  }

  function resetDesignForm() {
    setDesignForm(emptyDesignForm);
    setEditingDesignId("");
  }

  function handleTrendingChange(event) {
    setTrendingForm({
      ...trendingForm,
      [event.target.name]: event.target.value,
    });
  }

  function resetTrendingForm() {
    setTrendingForm(emptyTrendingForm);
    setEditingTrendingId("");
  }

  function handleOfflineChange(event) {
    const { name, value } = event.target;
    if (name === "outfitCategory") {
      const subs = subCategoriesMap[value] || [];
      const firstSub = subs[0] || "";
      setOfflineForm({ ...offlineForm, outfitCategory: value, subCategory: firstSub, price: subCategoryPriceMap[firstSub] || "" });
    } else if (name === "subCategory") {
      setOfflineForm({ ...offlineForm, subCategory: value, price: subCategoryPriceMap[value] || "" });
    } else {
      setOfflineForm({ ...offlineForm, [name]: value });
    }
  }

  function resetOfflineForm() {
    setOfflineForm(emptyOfflineForm);
    setOfflineMeasurements({});
    setOfflineUnit("Inches");
    setShowOfflineMeasurements(false);
  }

  function getCustomerPhone(order) {
    if (!order) return "";
    const directPhone = order.customer_phone || order.customerPhone || order.phone;
    if (directPhone) return directPhone;

    // Fallback: look up in customers list by email or user_id
    const email = (order.customer_email || order.customerEmail || order.user_email || order.userEmail || "").toLowerCase();
    if (email) {
      const cust = customers.find((c) => c.email?.toLowerCase() === email);
      if (cust?.phone) return cust.phone;
    }

    if (order.user_id && order.user_id !== "offline") {
      const cust = customers.find((c) => c.id === order.user_id || c.uid === order.user_id);
      if (cust?.phone) return cust.phone;
    }

    return "";
  }

  async function handleOfflineSubmit(event) {
    event.preventDefault();
    setWhatsAppStatus(null);

    const digits = offlineForm.customerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setWhatsAppStatus({
        type: "error",
        message: "Please enter a valid 10-digit customer mobile number.",
      });
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
      };

      setOrders((prev) => [newOrder, ...prev]);
      resetOfflineForm();

      try {
        generateInvoicePDF(orderForWA);
        const waLink = buildWhatsAppOrderLink(orderForWA);
        window.open(waLink, "_blank", "noopener,noreferrer");
        setWhatsAppStatus({
          type: "success",
          message: "Order saved. Click below to open WhatsApp if it did not open automatically.",
          link: waLink,
        });
      } catch (waErr) {
        setWhatsAppStatus({
          type: "success",
          message: `Order saved. (WhatsApp Error: ${waErr.message})`,
        });
      }
    } catch (err) {
      setWhatsAppStatus({ type: "error", message: err.message || "Failed to save order." });
    }
  }

  function handleSendWhatsApp(order) {
    try {
      const phone = getCustomerPhone(order);
      const orderForWA = {
        ...order,
        outfit: order.outfit || { title: order.outfit_type },
        fabricImage: order.fabric_image,
        customerName: order.customer_name || order.customerName || order.user_name || "Customer",
        customerPhone: phone,
        customization: order.customization,
        price: order.price || order.total_price,
      };
      generateInvoicePDF(orderForWA);
      const waLink = buildWhatsAppOrderLink(orderForWA);
      window.open(waLink, "_blank", "noopener,noreferrer");
      setWhatsAppStatus({
        type: "success",
        message: "WhatsApp link generated. Click below to open chat if it did not open automatically.",
        link: waLink,
      });
    } catch (err) {
      setWhatsAppStatus({ type: "error", message: `Could not open WhatsApp: ${err.message}` });
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    const productData = {
      name: form.name,
      category: form.category,
      stock: Number(form.stock),
      image_url: form.image || boutiqueImages.intro,
      description: form.description,
    };

    try {
      if (editingId) {
        const data = await updateProduct(editingId, productData);
        setProducts((prev) => prev.map((p) => p.id === editingId ? data.product : p));
      } else {
        const data = await createProduct(productData);
        setProducts((prev) => [data.product, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error("Product save error:", err);
    }
  }

  function handleEditProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image_url || product.image || "",
      description: product.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteProduct(productId) {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      if (editingId === productId) resetForm();
    } catch (err) {
      console.error("Delete product error:", err);
    }
  }

  async function handleDesignSubmit(event) {
    event.preventDefault();
    const parentProduct = products.find(
      (product) => product.id === designForm.parentProductId,
    );
    const designData = {
      parent_product_id: designForm.parentProductId,
      category: parentProduct?.category || "",
      name: designForm.name.trim(),
      image_url: designForm.image.trim() || boutiqueImages.intro,
      price: Number(designForm.price) || 0,
      stock: Number(designForm.stock) || 0,
      description: designForm.description.trim(),
    };

    try {
      if (editingDesignId) {
        const data = await updateProductDesign(editingDesignId, designData);
        setProductDesigns((prev) =>
          prev.map((design) =>
            design.id === editingDesignId ? data.design : design,
          ),
        );
      } else {
        const data = await createProductDesign(designData);
        setProductDesigns((prev) => [data.design, ...prev]);
      }
      resetDesignForm();
    } catch (err) {
      console.error("Product design save error:", err);
    }
  }

  function handleEditDesign(design) {
    const parentProduct = products.find(
      (product) =>
        product.id === design.parent_product_id ||
        product.category === design.category,
    );

    setEditingDesignId(design.id);
    setDesignForm({
      parentProductId: parentProduct?.id || design.parent_product_id || "",
      name: design.name || "",
      image: design.image_url || design.image || "",
      price: String(design.price || ""),
      stock: String(design.stock || ""),
      description: design.description || "",
    });
    document
      .querySelector("#section-product-designs")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDeleteDesign(designId) {
    try {
      await deleteProductDesign(designId);
      setProductDesigns((prev) =>
        prev.filter((design) => design.id !== designId),
      );
      if (editingDesignId === designId) resetDesignForm();
    } catch (err) {
      console.error("Delete product design error:", err);
    }
  }

  async function handleTrendingSubmit(event) {
    event.preventDefault();
    const designData = {
      title: trendingForm.title.trim(),
      image_url: trendingForm.image.trim() || boutiqueImages.intro,
      description: trendingForm.description.trim(),
    };

    try {
      if (editingTrendingId) {
        const data = await updateTrendingDesign(editingTrendingId, designData);
        setTrendingDesigns((prev) =>
          prev.map((design) =>
            design.id === editingTrendingId ? data.design : design,
          ),
        );
      } else {
        const data = await createTrendingDesign(designData);
        setTrendingDesigns((prev) => [data.design, ...prev]);
      }
      resetTrendingForm();
    } catch (err) {
      console.error("Trending design save error:", err);
    }
  }

  function handleEditTrending(design) {
    setEditingTrendingId(design.id);
    setTrendingForm({
      title: design.title || "",
      image: design.image_url || design.image || "",
      description: design.description || "",
    });
    document
      .querySelector("#section-trending")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDeleteTrending(designId) {
    try {
      await deleteTrendingDesign(designId);
      setTrendingDesigns((prev) =>
        prev.filter((design) => design.id !== designId),
      );
      if (editingTrendingId === designId) resetTrendingForm();
    } catch (err) {
      console.error("Delete trending design error:", err);
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const data = await updateOrderStatus(orderId, status);
      const updatedOrder = data.order;
      setOrders((prev) => prev.map((o) => o.id === orderId ? updatedOrder : o));

      const phone = getCustomerPhone(updatedOrder);
      if (status === "Ready" && phone) {
        const orderForWA = {
          ...updatedOrder,
          outfit: updatedOrder.outfit || { title: updatedOrder.outfit_type },
          fabricImage: updatedOrder.fabric_image,
          customerName: updatedOrder.customer_name || updatedOrder.customerName || updatedOrder.user_name || "Customer",
          customerPhone: phone,
          customization: updatedOrder.customization,
          price: updatedOrder.price,
        };
        const readyMessage = buildWhatsAppReadyMessage(orderForWA);
        const waLink = buildWhatsAppOrderLink(orderForWA, readyMessage);
        window.open(waLink, "_blank", "noopener,noreferrer");
        setWhatsAppStatus({
          type: "success",
          message: `Order ${orderId} marked as Ready. Click below to notify customer via WhatsApp if it did not open automatically.`,
          link: waLink,
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  }

  async function handleDeleteOrder(order) {
    const confirmed = window.confirm(
      `Delete order ${order.id} for ${order.customer_name || order.customerName}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setWhatsAppStatus({ type: "success", message: `Order ${order.id} deleted.` });
    } catch (err) {
      setWhatsAppStatus({ type: "error", message: err.message || "Failed to delete order." });
    }
  }

  async function handleDeleteFeedback(feedbackId) {
    const confirmed = window.confirm("Are you sure you want to delete this feedback?");
    if (!confirmed) return;
    try {
      await deleteFeedback(feedbackId);
      setFeedback((prev) => prev.filter((fb) => fb.id !== feedbackId));
    } catch (err) {
      console.error("Delete feedback error:", err);
    }
  }

  if (loading) {
    return (
      <section className="page-shell flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner label="Loading dashboard" />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">Admin Dashboard</p>
          <h1 className="section-title">Boutique management panel</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
            Manage products, monitor orders, update stitching status, and review customer activity.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={loadAll} className="btn-secondary">
            <RefreshCw size={17} />
            Refresh
          </button>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-6">
        <StatCard icon={PackageCheck} label="Products"  value={products.length}  isActive={activeTab === "products"}  onClick={() => setActiveTab("products")} />
        <StatCard icon={ShoppingBag} label="Designs" value={productDesigns.length} isActive={activeTab === "designs"}  onClick={() => setActiveTab("designs")} />
        <StatCard icon={ImageIcon} label="Trending" value={trendingDesigns.length} isActive={activeTab === "trending"} onClick={() => setActiveTab("trending")} />
        <StatCard icon={ShoppingBag} label="Orders"    value={orders.length}    isActive={activeTab === "orders"}   onClick={() => setActiveTab("orders")} />
        <StatCard icon={Users}       label="Customers" value={customers.length} isActive={activeTab === "customers"} onClick={() => setActiveTab("customers")} />
        <StatCard icon={MessageSquareText} label="Feedback" value={feedback.length} isActive={activeTab === "feedback"} onClick={() => setActiveTab("feedback")} />
      </div>

      {/* ── Products Tab ── */}
      {activeTab === "products" && (
        <div id="section-products" className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr] scroll-mt-6 animate-fadeUp">
          <form className="card h-fit p-5" onSubmit={handleProductSubmit}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-gold">{editingId ? "Edit product" : "Add product"}</p>
                <h2 className="font-display text-2xl font-bold text-plum">Product Form</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-md bg-lavender text-plum">
                {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
              </span>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-plum">
                Product Name
                <input className="input-field" name="name" value={form.name} onChange={handleFormChange} required />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-plum">
                  Category
                  <select className="input-field" name="category" value={form.category} onChange={handleFormChange}>
                    {["Blouse", "Kurti", "Long Frock", "Lehenga"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-plum">
                  Stock
                  <input className="input-field" type="number" min="0" name="stock" value={form.stock} onChange={handleFormChange} required />
                </label>
              </div>


              <label className="grid gap-2 text-sm font-bold text-plum">
                Image URL
                <input className="input-field" name="image" value={form.image} onChange={handleFormChange} placeholder="https://..." />
              </label>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Description
                <textarea className="input-field min-h-28 resize-y" name="description" value={form.description} onChange={handleFormChange} required />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="btn-primary flex-1">
                  <Save size={17} />
                  {editingId ? "Update Product" : "Add Product"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
                )}
              </div>
            </div>
          </form>

          <div className="card overflow-hidden">
            <div className="border-b border-plum/10 p-5">
              <h2 className="font-display text-2xl font-bold text-plum">View All Products</h2>
            </div>
            {products.length ? (
              <div className="divide-y divide-plum/10">
                {products.map((product) => (
                  <article key={product.id} className="grid gap-4 p-5 md:grid-cols-[130px_1fr]">
                    <img src={product.image_url || product.image || boutiqueImages.intro} alt={product.name} className="h-32 w-full rounded-lg object-cover" />
                    <div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <p className="text-xs font-bold uppercase text-gold">{product.category}</p>
                          <h3 className="font-display text-2xl font-bold text-plum">{product.name}</h3>
                          <p className="mt-1 text-sm leading-6 text-ink/65">{product.description}</p>
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-xs font-bold uppercase text-ink/50">Stock: {product.stock}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={() => handleEditProduct(product)} className="btn-secondary flex-1">
                          <Edit3 size={17} /> Edit Product
                        </button>
                        <button type="button" onClick={() => handleDeleteProduct(product.id)} className="btn-secondary flex-1">
                          <Trash2 size={17} /> Delete Product
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-ink/60">No products available. Add your first product.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Designs Tab ── */}
      {activeTab === "designs" && (
        <div id="section-product-designs" className="mt-6 grid gap-6 scroll-mt-6 xl:grid-cols-[0.85fr_1.15fr] animate-fadeUp">
          <form className="card h-fit p-5" onSubmit={handleDesignSubmit}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-gold">
                  {editingDesignId ? "Edit category design" : "Add category design"}
                </p>
                <h2 className="font-display text-2xl font-bold text-plum">
                  Product Design Form
                </h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-md bg-lavender text-plum">
                {editingDesignId ? <Edit3 size={20} /> : <Plus size={20} />}
              </span>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-plum">
                Main Product
                <select
                  className="input-field"
                  name="parentProductId"
                  value={designForm.parentProductId}
                  onChange={handleDesignChange}
                  required
                >
                  <option value="">Select product category</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.category} - {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Design Name
                <input
                  className="input-field"
                  name="name"
                  value={designForm.name}
                  onChange={handleDesignChange}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Image URL
                <input
                  className="input-field"
                  name="image"
                  value={designForm.image}
                  onChange={handleDesignChange}
                  placeholder="https://..."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-plum">
                  Price
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    name="price"
                    value={designForm.price}
                    onChange={handleDesignChange}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-plum">
                  Stock
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    name="stock"
                    value={designForm.stock}
                    onChange={handleDesignChange}
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Description
                <textarea
                  className="input-field min-h-28 resize-y"
                  name="description"
                  value={designForm.description}
                  onChange={handleDesignChange}
                  required
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="btn-primary flex-1">
                  <Save size={17} />
                  {editingDesignId ? "Update Design" : "Add Design"}
                </button>
                {editingDesignId && (
                  <button
                    type="button"
                    onClick={resetDesignForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="card overflow-hidden">
            <div className="border-b border-plum/10 p-5">
              <h2 className="font-display text-2xl font-bold text-plum">
                Category Designs
              </h2>
            </div>
            {productDesigns.length ? (
              <div className="divide-y divide-plum/10">
                {productDesigns.map((design) => (
                  <article
                    key={design.id}
                    className="grid gap-4 p-5 md:grid-cols-[130px_1fr]"
                  >
                    <img
                      src={design.image_url || design.image || boutiqueImages.intro}
                      alt={design.name}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <p className="text-xs font-bold uppercase text-gold">
                            {design.category}
                          </p>
                          <h3 className="font-display text-2xl font-bold text-plum">
                            {design.name}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-ink/65">
                            {design.description}
                          </p>
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-lg font-bold text-rose">
                            {formatPrice(design.price)}
                          </p>
                          <p className="text-xs font-bold uppercase text-ink/50">
                            Stock: {design.stock}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleEditDesign(design)}
                          className="btn-secondary flex-1"
                        >
                          <Edit3 size={17} /> Edit Design
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDesign(design.id)}
                          className="btn-secondary flex-1"
                        >
                          <Trash2 size={17} /> Delete Design
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-ink/60">
                No category designs available. Add designs under Blouse, Kurti,
                Long Frock, or Lehenga.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Trending Tab ── */}
      {activeTab === "trending" && (
        <div id="section-trending" className="mt-6 grid gap-6 scroll-mt-6 xl:grid-cols-[0.85fr_1.15fr] animate-fadeUp">
          <form className="card h-fit p-5" onSubmit={handleTrendingSubmit}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-gold">
                  {editingTrendingId ? "Edit design" : "Add design"}
                </p>
                <h2 className="font-display text-2xl font-bold text-plum">
                  Trending Design Form
                </h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-md bg-lavender text-plum">
                {editingTrendingId ? <Edit3 size={20} /> : <Plus size={20} />}
              </span>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-plum">
                Title
                <input
                  className="input-field"
                  name="title"
                  value={trendingForm.title}
                  onChange={handleTrendingChange}
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Image URL
                <input
                  className="input-field"
                  name="image"
                  value={trendingForm.image}
                  onChange={handleTrendingChange}
                  placeholder="https://..."
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-plum">
                Description
                <textarea
                  className="input-field min-h-28 resize-y"
                  name="description"
                  value={trendingForm.description}
                  onChange={handleTrendingChange}
                  required
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="btn-primary flex-1">
                  <Save size={17} />
                  {editingTrendingId ? "Update Design" : "Add Design"}
                </button>
                {editingTrendingId && (
                  <button
                    type="button"
                    onClick={resetTrendingForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="card overflow-hidden">
            <div className="border-b border-plum/10 p-5">
              <h2 className="font-display text-2xl font-bold text-plum">
                Home Trending Designs
              </h2>
            </div>
            {trendingDesigns.length ? (
              <div className="divide-y divide-plum/10">
                {trendingDesigns.map((design) => (
                  <article
                    key={design.id}
                    className="grid gap-4 p-5 md:grid-cols-[130px_1fr]"
                  >
                    <img
                      src={design.image_url || design.image || boutiqueImages.intro}
                      alt={design.title}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-display text-2xl font-bold text-plum">
                        {design.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-ink/65">
                        {design.description}
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleEditTrending(design)}
                          className="btn-secondary flex-1"
                        >
                          <Edit3 size={17} /> Edit Design
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrending(design.id)}
                          className="btn-secondary flex-1"
                        >
                          <Trash2 size={17} /> Delete Design
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-ink/60">
                No trending designs available. Add your first design.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Orders Tab ── */}
      {activeTab === "orders" && (
        <div className="mt-6 animate-fadeUp">
          <div id="section-orders" className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr] items-start scroll-mt-6">
            <div className="card overflow-hidden">
              <div className="border-b border-plum/10 p-5">
                <h2 className="font-display text-2xl font-bold text-plum">Active Orders</h2>
              </div>
              {whatsAppStatus && (
                <div className={`m-5 rounded-md px-4 py-3 text-sm font-semibold flex flex-col gap-2 ${
                  whatsAppStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-rose/10 text-rose"
                }`}>
                  <div className="flex justify-between items-center gap-4">
                    <p>{whatsAppStatus.message}</p>
                    <button
                      type="button"
                      onClick={() => setWhatsAppStatus(null)}
                      className="text-current opacity-70 hover:opacity-100 text-xs font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                  {whatsAppStatus.link && (
                    <a
                      href={whatsAppStatus.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-1.5 px-3 text-xs w-fit bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                    >
                      <MessageCircle size={14} /> Open WhatsApp Chat
                    </a>
                  )}
                </div>
              )}
              {activeOrders.length ? (
                <div className="divide-y divide-plum/10">
                  {activeOrders.map((order) => (
                    <article key={order.id} className="grid gap-4 p-5 lg:grid-cols-[140px_1fr]">
                      <img src={order.fabric_image || order.fabricImage} alt="Uploaded fabric" className="h-36 w-full rounded-lg object-cover" />
                      <div>
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <p className="text-xs font-bold uppercase text-gold">{order.id}</p>
                            <h3 className="font-display text-2xl font-bold text-plum">{order.outfit?.title || order.outfit_type}</h3>
                            <p className="text-sm text-ink/58">
                              {order.customer_name || order.user_name} · {order.customer_email || order.user_email}
                            </p>
                          </div>
                          <label className="grid gap-2 text-sm font-bold text-plum">
                            Update Order Status
                            <select
                              className="input-field max-w-56"
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              {orderStatusOptions.map((s) => <option key={s}>{s}</option>)}
                            </select>
                          </label>
                        </div>

                        {(order.is_product_order || !order.measurements || Object.keys(order.measurements).length === 0) ? (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <Info label="Price"   value={formatPrice(order.price)} />
                            <Info label="Phone"   value={getCustomerPhone(order) || "N/A"} />
                            <Info label="Type"    value="Ready-made Product" />
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <Info label="Price"   value={formatPrice(order.price)} />
                            <Info label="Phone"   value={getCustomerPhone(order) || "N/A"} />
                            <Info label="Neck"    value={order.customization?.neckStyle || "N/A"} />
                            <Info label="Sleeve"  value={order.customization?.sleeveStyle || "N/A"} />
                            <Info label="Fitting" value={order.customization?.fittingStyle || "N/A"} />
                          </div>
                        )}

                        {!order.is_product_order && order.measurements && Object.keys(order.measurements).length > 0 && expandedOrders[order.id] && (
                          <div className="mt-4 rounded-lg bg-cream/35 border border-plum/5 p-4 animate-fadeUp">
                            <p className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Measurements & Dimensions</p>
                            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                              {Object.entries(order.measurements).map(([key, val]) => {
                                if (val === undefined || val === null || val === "") return null;
                                const label = measurementLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                  <div key={key} className="rounded bg-white border border-plum/5 p-2 flex flex-col justify-between shadow-sm">
                                    <span className="text-[10px] uppercase font-bold text-plum/50 tracking-wider leading-none">{label}</span>
                                    <span className="text-xs font-bold text-plum mt-1">{val} {order.unit || "Inches"}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          {!order.is_product_order && order.measurements && Object.keys(order.measurements).length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleMeasurements(order.id)}
                              className="btn-secondary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                            >
                              {expandedOrders[order.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              {expandedOrders[order.id] ? "Hide Measurements" : "View Measurements"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(order)}
                            className="btn-secondary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle size={14} /> Send WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order)}
                            className="btn-secondary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                          >
                            <Trash2 size={14} /> Delete Order
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-ink/60">No active orders.</div>
              )}
            </div>

            <div className="grid gap-6">
              {/* ── Add Offline Customer Order ── */}
              <form className="card p-5" onSubmit={handleOfflineSubmit}>
                <h2 className="font-display text-2xl font-bold text-plum">Add Offline Customer Order</h2>
                <p className="mt-2 text-sm text-ink/60">Enter customer details and product for offline customers.</p>

                <div className="mt-4 grid gap-3">
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    Customer Name
                    <input className="input-field" name="customerName" value={offlineForm.customerName} onChange={handleOfflineChange} required />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    Email
                    <input className="input-field" type="email" name="customerEmail" value={offlineForm.customerEmail} onChange={handleOfflineChange} />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    WhatsApp Mobile Number
                    <input className="input-field" name="customerPhone" value={offlineForm.customerPhone} onChange={handleOfflineChange} placeholder="9876543210 or 919876543210" required />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    Outfit Title (optional)
                    <input className="input-field" name="outfitTitle" value={offlineForm.outfitTitle} onChange={handleOfflineChange} />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="grid gap-2 text-sm font-bold text-plum">
                      Category
                      <select className="input-field" name="outfitCategory" value={offlineForm.outfitCategory} onChange={handleOfflineChange}>
                        {["Blouse", "Kurti", "Long Frock", "Lehenga"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-plum">
                      Sub Category
                      <select className="input-field" name="subCategory" value={offlineForm.subCategory} onChange={handleOfflineChange}>
                        {(subCategoriesMap[offlineForm.outfitCategory] || []).map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-plum">
                      Price
                      <input className="input-field" type="number" min="0" name="price" value={offlineForm.price} onChange={handleOfflineChange} />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    Fabric Image URL (optional)
                    <input className="input-field" name="fabricImage" value={offlineForm.fabricImage} onChange={handleOfflineChange} placeholder="https://..." />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="grid gap-2 text-sm font-bold text-plum">
                      Neck
                      <select className="input-field" name="neckStyle" value={offlineForm.neckStyle} onChange={handleOfflineChange}>
                        {neckStyles.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-plum">
                      Sleeve
                      <select className="input-field" name="sleeveStyle" value={offlineForm.sleeveStyle} onChange={handleOfflineChange}>
                        {sleeveStyles.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-plum">
                      Fitting
                      <select className="input-field" name="fittingStyle" value={offlineForm.fittingStyle} onChange={handleOfflineChange}>
                        {fittingOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="mt-2 border-t border-plum/10 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-plum">
                      <input
                        type="checkbox"
                        checked={showOfflineMeasurements}
                        onChange={(e) => setShowOfflineMeasurements(e.target.checked)}
                        className="rounded border-plum/20 text-plum focus:ring-plum"
                      />
                      Add Custom Measurements
                    </label>
                  </div>

                  {showOfflineMeasurements && (
                    <div className="grid gap-3 border border-plum/10 rounded-lg bg-cream/40 p-4 animate-fadeUp">
                      <div className="flex items-center justify-between border-b border-plum/5 pb-2">
                        <span className="text-xs font-bold text-plum/70">Measurements ({offlineUnit})</span>
                        <div className="flex rounded bg-white p-0.5 shadow-sm border border-plum/5">
                          {["Inches", "CM"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setOfflineUnit(item)}
                              className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${
                                offlineUnit === item
                                  ? "bg-plum text-white"
                                  : "text-plum hover:bg-lavender"
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {offlineFields.map((field) => (
                          <label key={field.key} className="grid gap-1 text-xs font-bold text-plum">
                            {field.name}
                            <input
                              className="input-field py-1.5 text-sm"
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder={offlineUnit}
                              value={offlineMeasurements[field.key] || ""}
                              onChange={(e) => setOfflineMeasurements({
                                ...offlineMeasurements,
                                [field.key]: e.target.value
                              })}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-3">
                    <button type="submit" className="btn-primary flex-1">
                      <Save size={17} /> Save & Send WhatsApp
                    </button>
                    <button type="button" onClick={resetOfflineForm} className="btn-secondary">Cancel</button>
                  </div>

                  {whatsAppStatus && (
                    <div className={`rounded-md px-4 py-3 text-sm font-semibold flex flex-col gap-2 ${
                      whatsAppStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-rose/10 text-rose"
                    }`}>
                      <p>{whatsAppStatus.message}</p>
                      {whatsAppStatus.link && (
                        <a
                          href={whatsAppStatus.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary py-1.5 px-3 text-xs w-fit bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                        >
                          <MessageCircle size={14} /> Open WhatsApp Chat
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Previous Orders (Delivered) */}
          {deliveredOrders.length > 0 && (
            <div className="mt-6 card overflow-hidden">
              <div className="border-b border-plum/10 p-5">
                <h2 className="font-display text-2xl font-bold text-plum">Previous Orders (Delivered)</h2>
              </div>
              <div className="divide-y divide-plum/10">
                {deliveredOrders.map((order) => (
                  <article key={order.id} className="grid gap-4 p-5 lg:grid-cols-[140px_1fr]">
                    <img src={order.fabric_image || order.fabricImage} alt="Uploaded fabric" className="h-36 w-full rounded-lg object-cover" />
                    <div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <p className="text-xs font-bold uppercase text-gold">{order.id}</p>
                          <h3 className="font-display text-2xl font-bold text-plum">{order.outfit?.title || order.outfit_type}</h3>
                          <p className="text-sm text-ink/58">
                            {order.customer_name || order.user_name} · {order.customer_email || order.user_email}
                          </p>
                        </div>
                        <span className="h-fit rounded-md bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                          ✅ Delivered
                        </span>
                      </div>

                      {(order.is_product_order || !order.measurements || Object.keys(order.measurements).length === 0) ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <Info label="Price"   value={formatPrice(order.price)} />
                          <Info label="Phone"   value={getCustomerPhone(order) || "N/A"} />
                          <Info label="Type"    value="Ready-made Product" />
                        </div>
                      ) : (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <Info label="Price"   value={formatPrice(order.price)} />
                          <Info label="Phone"   value={getCustomerPhone(order) || "N/A"} />
                          <Info label="Neck"    value={order.customization?.neckStyle || "N/A"} />
                          <Info label="Sleeve"  value={order.customization?.sleeveStyle || "N/A"} />
                          <Info label="Fitting" value={order.customization?.fittingStyle || "N/A"} />
                        </div>
                      )}

                      {!order.is_product_order && order.measurements && Object.keys(order.measurements).length > 0 && expandedOrders[order.id] && (
                        <div className="mt-4 rounded-lg bg-cream/35 border border-plum/5 p-4 animate-fadeUp">
                          <p className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Measurements & Dimensions</p>
                          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                            {Object.entries(order.measurements).map(([key, val]) => {
                              if (val === undefined || val === null || val === "") return null;
                              const label = measurementLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                              return (
                                <div key={key} className="rounded bg-white border border-plum/5 p-2 flex flex-col justify-between shadow-sm">
                                  <span className="text-[10px] uppercase font-bold text-plum/50 tracking-wider leading-none">{label}</span>
                                  <span className="text-xs font-bold text-plum mt-1">{val} {order.unit || "Inches"}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        {!order.is_product_order && order.measurements && Object.keys(order.measurements).length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleMeasurements(order.id)}
                            className="btn-secondary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                          >
                            {expandedOrders[order.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            {expandedOrders[order.id] ? "Hide Measurements" : "View Measurements"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(order)}
                          className="btn-secondary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle size={14} /> Send WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order)}
                          className="btn-secondary text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5"
                        >
                          <Trash2 size={14} /> Delete Order
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Customers Tab ── */}
      {activeTab === "customers" && (
        <div className="card overflow-hidden mt-6 animate-fadeUp">
          <div className="border-b border-plum/10 p-5 bg-white">
            <h2 className="font-display text-2xl font-bold text-plum">Registered Customers</h2>
          </div>

          {customerStats.length ? (
            <div className="divide-y divide-plum/10">
              {customerStats.map((customer) => (
                <article
                  key={customer.id || customer.email}
                  className="grid gap-4 p-5 md:grid-cols-[2fr_1fr_1fr] items-center"
                >
                  <div>
                    <h3 className="font-display text-xl font-bold text-plum">{customer.name}</h3>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-ink/65">
                      <span className="flex items-center gap-2">
                        <Mail size={14} className="text-gold" />
                        <a href={`mailto:${customer.email}`} className="hover:text-plum hover:underline">
                          {customer.email}
                        </a>
                      </span>
                      {customer.phone && (
                        <span className="flex items-center gap-2">
                          <Phone size={14} className="text-gold" />
                          <span>{customer.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left md:text-center">
                    <p className="text-xs font-bold uppercase text-ink/50">Total Orders</p>
                    <p className="text-lg font-bold text-plum">{customer.ordersCount} orders</p>
                    <p className="text-xs text-ink/60">Spent: {formatPrice(customer.totalSpent)}</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    {customer.phone ? (
                      <a
                        href={`https://wa.me/${normalizeWhatsAppPhone(customer.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white w-full md:w-auto justify-center py-2 px-4 shadow-sm"
                      >
                        <MessageCircle size={15} />
                        WhatsApp Chat
                      </a>
                    ) : (
                      <span className="text-xs text-ink/40 font-semibold italic">No phone contact</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-ink/60">No customer accounts registered yet.</div>
          )}
        </div>
      )}

      {/* ── Feedback Tab ── */}
      {activeTab === "feedback" && (
        <div id="section-feedback" className="card p-5 mt-6 scroll-mt-6 animate-fadeUp">
          <h2 className="font-display text-2xl font-bold text-plum">Recent Feedback</h2>
          <div className="mt-4 grid gap-3">
            {feedback.length ? (
              feedback.map((item) => (
                <article key={item.id} className="rounded-lg bg-cream p-4 border border-plum/5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-plum">{item.name}</p>
                      <p className="text-xs font-bold uppercase text-gold">{item.rating}/5 · {item.outfit_type || item.outfitType}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="p-1.5 text-rose/70 hover:text-rose hover:bg-rose/10 rounded transition"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/68">"{item.message}"</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-ink/60">No feedback yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({ icon: Icon, label, value, href, onClick }) {
  function handleClick(e) {
    if (onClick) {
      onClick();
      return;
    }
    if (!href) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      onClick={handleClick}
      className="card flex items-center gap-4 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      <span className="grid h-12 w-12 place-items-center rounded-md bg-lavender text-plum">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink/60">{label}</p>
        <p className="font-display text-3xl font-bold text-plum">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <span className="rounded-md bg-white px-3 py-2 text-xs font-bold text-plum">
      {label}: {value}
    </span>
  );
}
