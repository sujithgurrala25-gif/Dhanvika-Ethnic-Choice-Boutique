import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Upload,
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
import Pagination from "../components/Pagination.jsx";
import { compressImage } from "../utils/image.js";

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


export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]   = useState([]);
  const [productDesigns, setProductDesigns] = useState([]);
  const [trendingDesigns, setTrendingDesigns] = useState([]);
  const [orders, setOrders]       = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderSortBy, setOrderSortBy] = useState("orderDate");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

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

  const ADMIN_PAGE_SIZE = 8;
  const [productsPage, setProductsPage] = useState(1);
  const [designsPage, setDesignsPage] = useState(1);
  const [trendingPage, setTrendingPage] = useState(1);
  const [activeOrdersPage, setActiveOrdersPage] = useState(1);
  const [deliveredOrdersPage, setDeliveredOrdersPage] = useState(1);
  const [feedbackPage, setFeedbackPage] = useState(1);



  const activeOrders = useMemo(() => {
    let list = orders;
    if (orderStatusFilter === "All") {
      list = list.filter((o) => o.status !== "Delivered");
    } else {
      list = list.filter((o) => o.status === orderStatusFilter);
    }
    if (orderSortBy === "orderDate") {
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
    } else if (orderSortBy === "deliveryDate") {
      list.sort((a, b) => {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate) : new Date(8640000000000000);
        const dateB = b.deliveryDate ? new Date(b.deliveryDate) : new Date(8640000000000000);
        return dateA - dateB;
      });
    }
    return list;
  }, [orders, orderSortBy, orderStatusFilter]);

  const deliveredOrders = useMemo(() => {
    let list = orders.filter((o) => o.status === "Delivered");
    if (orderSortBy === "orderDate") {
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
    } else if (orderSortBy === "deliveryDate") {
      list.sort((a, b) => {
        const dateA = a.deliveryDate ? new Date(a.deliveryDate) : new Date(8640000000000000);
        const dateB = b.deliveryDate ? new Date(b.deliveryDate) : new Date(8640000000000000);
        return dateA - dateB;
      });
    }
    return list;
  }, [orders, orderSortBy]);

  const productsTotalPages = Math.ceil(products.length / ADMIN_PAGE_SIZE);
  const pagedProducts = products.slice((productsPage - 1) * ADMIN_PAGE_SIZE, productsPage * ADMIN_PAGE_SIZE);

  const designsTotalPages = Math.ceil(productDesigns.length / ADMIN_PAGE_SIZE);
  const pagedDesigns = productDesigns.slice((designsPage - 1) * ADMIN_PAGE_SIZE, designsPage * ADMIN_PAGE_SIZE);

  const trendingTotalPages = Math.ceil(trendingDesigns.length / ADMIN_PAGE_SIZE);
  const pagedTrending = trendingDesigns.slice((trendingPage - 1) * ADMIN_PAGE_SIZE, trendingPage * ADMIN_PAGE_SIZE);

  const activeOrdersTotalPages = Math.ceil(activeOrders.length / ADMIN_PAGE_SIZE);
  const pagedActiveOrders = activeOrders.slice((activeOrdersPage - 1) * ADMIN_PAGE_SIZE, activeOrdersPage * ADMIN_PAGE_SIZE);

  const deliveredOrdersTotalPages = Math.ceil(deliveredOrders.length / ADMIN_PAGE_SIZE);
  const pagedDeliveredOrders = deliveredOrders.slice((deliveredOrdersPage - 1) * ADMIN_PAGE_SIZE, deliveredOrdersPage * ADMIN_PAGE_SIZE);



  const feedbackTotalPages = Math.ceil(feedback.length / ADMIN_PAGE_SIZE);
  const pagedFeedback = feedback.slice((feedbackPage - 1) * ADMIN_PAGE_SIZE, feedbackPage * ADMIN_PAGE_SIZE);

  const [form, setForm]             = useState(emptyProductForm);
  const [editingId, setEditingId]   = useState("");
  const [designForm, setDesignForm] = useState(emptyDesignForm);
  const [editingDesignId, setEditingDesignId] = useState("");
  const [trendingForm, setTrendingForm] = useState(emptyTrendingForm);
  const [editingTrendingId, setEditingTrendingId] = useState("");
  const [whatsAppStatus, setWhatsAppStatus] = useState(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingDesignImage, setUploadingDesignImage] = useState(false);
  const [uploadingTrendingImage, setUploadingTrendingImage] = useState(false);

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setUploadingProductImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result);
        setForm((prev) => ({ ...prev, image: compressed }));
      } catch (err) {
        console.error("Compression error:", err);
        setForm((prev) => ({ ...prev, image: reader.result }));
      } finally {
        setUploadingProductImage(false);
      }
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
      setUploadingProductImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDesignImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setUploadingDesignImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result);
        setDesignForm((prev) => ({ ...prev, image: compressed }));
      } catch (err) {
        console.error("Compression error:", err);
        setDesignForm((prev) => ({ ...prev, image: reader.result }));
      } finally {
        setUploadingDesignImage(false);
      }
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
      setUploadingDesignImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleTrendingImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setUploadingTrendingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compressed = await compressImage(reader.result);
        setTrendingForm((prev) => ({ ...prev, image: compressed }));
      } catch (err) {
        console.error("Compression error:", err);
        setTrendingForm((prev) => ({ ...prev, image: reader.result }));
      } finally {
        setUploadingTrendingImage(false);
      }
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
      setUploadingTrendingImage(false);
    };
    reader.readAsDataURL(file);
  };

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
    const displayId = order.orderNum || order.id;
    const confirmed = window.confirm(
      `Delete order ${displayId} for ${order.customer_name || order.customerName}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setWhatsAppStatus({ type: "success", message: `Order ${displayId} deleted.` });
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

      <div className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={PackageCheck} label="Products"  value={products.length}  isActive={activeTab === "products"}  onClick={() => setActiveTab("products")} />
        <StatCard icon={ShoppingBag} label="Designs" value={productDesigns.length} isActive={activeTab === "designs"}  onClick={() => setActiveTab("designs")} />
        <StatCard icon={ImageIcon} label="Trending" value={trendingDesigns.length} isActive={activeTab === "trending"} onClick={() => setActiveTab("trending")} />
        <StatCard icon={ShoppingBag} label="Orders"    value={orders.length}    isActive={activeTab === "orders"}   onClick={() => setActiveTab("orders")} />
        <StatCard icon={MessageSquareText} label="Feedback" value={feedback.length} isActive={activeTab === "feedback"} onClick={() => setActiveTab("feedback")} />
        <StatCard icon={Plus}        label="Offline Order" value="+ Add" onClick={() => navigate("/admin-add-offline-order")} />
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


              <div className="grid gap-2 text-sm font-bold text-plum">
                <span>Image URL (or upload local file)</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input className="input-field flex-grow" name="image" value={form.image} onChange={handleFormChange} placeholder="https://..." />
                  <label className="btn-secondary py-3 px-4 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-w-[140px] text-xs">
                    {uploadingProductImage ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-plum border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingProductImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={form.image} alt="Product Preview" className="h-14 w-14 rounded object-cover border border-plum/10" onError={(e) => { e.target.style.display = 'none'; }} />
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, image: "" }))} className="text-xs font-semibold text-rose hover:underline">Remove</button>
                  </div>
                )}
              </div>

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
              <>
                <div className="divide-y divide-plum/10">
                  {pagedProducts.map((product) => (
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
                {productsTotalPages > 1 && (
                  <div className="p-5 border-t border-plum/10 bg-white">
                    <Pagination current={productsPage} total={productsTotalPages} onChange={setProductsPage} />
                  </div>
                )}
              </>
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

              <div className="grid gap-2 text-sm font-bold text-plum">
                <span>Image URL (or upload local file)</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    className="input-field flex-grow"
                    name="image"
                    value={designForm.image}
                    onChange={handleDesignChange}
                    placeholder="https://..."
                  />
                  <label className="btn-secondary py-3 px-4 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-w-[140px] text-xs">
                    {uploadingDesignImage ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-plum border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDesignImageUpload}
                      disabled={uploadingDesignImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {designForm.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={designForm.image} alt="Design Preview" className="h-14 w-14 rounded object-cover border border-plum/10" onError={(e) => { e.target.style.display = 'none'; }} />
                    <button type="button" onClick={() => setDesignForm((prev) => ({ ...prev, image: "" }))} className="text-xs font-semibold text-rose hover:underline">Remove</button>
                  </div>
                )}
              </div>

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
              <>
                <div className="divide-y divide-plum/10">
                  {pagedDesigns.map((design) => (
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
                {designsTotalPages > 1 && (
                  <div className="p-5 border-t border-plum/10 bg-white">
                    <Pagination current={designsPage} total={designsTotalPages} onChange={setDesignsPage} />
                  </div>
                )}
              </>
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

              <div className="grid gap-2 text-sm font-bold text-plum">
                <span>Image URL (or upload local file)</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    className="input-field flex-grow"
                    name="image"
                    value={trendingForm.image}
                    onChange={handleTrendingChange}
                    placeholder="https://..."
                  />
                  <label className="btn-secondary py-3 px-4 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-w-[140px] text-xs">
                    {uploadingTrendingImage ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-plum border-t-transparent" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTrendingImageUpload}
                      disabled={uploadingTrendingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {trendingForm.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={trendingForm.image} alt="Trending Preview" className="h-14 w-14 rounded object-cover border border-plum/10" onError={(e) => { e.target.style.display = 'none'; }} />
                    <button type="button" onClick={() => setTrendingForm((prev) => ({ ...prev, image: "" }))} className="text-xs font-semibold text-rose hover:underline">Remove</button>
                  </div>
                )}
              </div>

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
              <>
                <div className="divide-y divide-plum/10">
                  {pagedTrending.map((design) => (
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
                {trendingTotalPages > 1 && (
                  <div className="p-5 border-t border-plum/10 bg-white">
                    <Pagination current={trendingPage} total={trendingTotalPages} onChange={setTrendingPage} />
                  </div>
                )}
              </>
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
          <div id="section-orders" className="scroll-mt-6 w-full">
            <div className="card overflow-hidden">
              <div className="border-b border-plum/10 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 className="font-display text-2xl font-bold text-plum">Active Orders</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor="active-order-status" className="text-xs font-bold text-plum/70 uppercase whitespace-nowrap">Filter Status:</label>
                    <select
                      id="active-order-status"
                      className="input-field py-1 px-3 text-sm max-w-56"
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                    >
                      <option value="All">All Active</option>
                      <option value="Order Received">Order Received</option>
                      <option value="Cutting">Cutting</option>
                      <option value="Stitching">Stitching</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="active-order-sort" className="text-xs font-bold text-plum/70 uppercase whitespace-nowrap">Sort by:</label>
                    <select
                      id="active-order-sort"
                      className="input-field py-1 px-3 text-sm max-w-56"
                      value={orderSortBy}
                      onChange={(e) => setOrderSortBy(e.target.value)}
                    >
                      <option value="orderDate">Order Date</option>
                      <option value="deliveryDate">Delivery Date</option>
                    </select>
                  </div>
                </div>
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
                <>
                  <div className="divide-y divide-plum/10">
                    {pagedActiveOrders.map((order) => (
                      <article key={order.id} className="grid gap-4 p-5 lg:grid-cols-[140px_1fr]">
                        <img src={order.fabric_image || order.fabricImage} alt="Uploaded fabric" className="h-36 w-full rounded-lg object-cover" />
                        <div>
                          <div className="flex flex-col justify-between gap-3 sm:flex-row">
                            <div>
                              <p className="text-xs font-bold uppercase text-gold">{order.orderNum || order.id}</p>
                              <h3 className="font-display text-2xl font-bold text-plum">{order.outfit?.title || order.outfit_type}</h3>
                              <p className="text-sm text-ink/58">
                                {order.customer_name || order.user_name} · {order.customer_email || order.user_email}
                              </p>
                              {order.createdAt && (
                                <p className="mt-1 text-xs text-ink/60 font-medium">
                                  Order Date: {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              )}
                              {order.deliveryDate && (
                                <p className="mt-1 text-xs text-rose font-bold">
                                  Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}
                                </p>
                              )}
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
                              <Info label="Delivery Date" value={order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"} />
                            </div>
                          ) : (
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              <Info label="Price"   value={formatPrice(order.price)} />
                              <Info label="Phone"   value={getCustomerPhone(order) || "N/A"} />
                              <Info label="Delivery Date" value={order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"} />
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
                  {activeOrdersTotalPages > 1 && (
                    <div className="p-5 border-t border-plum/10 bg-white">
                      <Pagination current={activeOrdersPage} total={activeOrdersTotalPages} onChange={setActiveOrdersPage} />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-sm text-ink/60">No active orders.</div>
              )}
            </div>
          </div>

          {/* Previous Orders (Delivered) */}
          {deliveredOrders.length > 0 && (
            <div className="mt-6 card overflow-hidden">
              <div className="border-b border-plum/10 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h2 className="font-display text-2xl font-bold text-plum">Previous Orders (Delivered)</h2>
                <div className="flex items-center gap-2">
                  <label htmlFor="delivered-order-sort" className="text-xs font-bold text-plum/70 uppercase whitespace-nowrap">Sort by:</label>
                  <select
                    id="delivered-order-sort"
                    className="input-field py-1 px-3 text-sm max-w-56"
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value)}
                  >
                    <option value="orderDate">Order Date</option>
                    <option value="deliveryDate">Delivery Date</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-plum/10">
                {pagedDeliveredOrders.map((order) => (
                  <article key={order.id} className="grid gap-4 p-5 lg:grid-cols-[140px_1fr]">
                    <img src={order.fabric_image || order.fabricImage} alt="Uploaded fabric" className="h-36 w-full rounded-lg object-cover" />
                    <div>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <p className="text-xs font-bold uppercase text-gold">{order.orderNum || order.id}</p>
                          <h3 className="font-display text-2xl font-bold text-plum">{order.outfit?.title || order.outfit_type}</h3>
                          <p className="text-sm text-ink/58">
                            {order.customer_name || order.user_name} · {order.customer_email || order.user_email}
                          </p>
                          {order.createdAt && (
                            <p className="mt-1 text-xs text-ink/60 font-medium">
                              Order Date: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          )}
                          {order.deliveryDate && (
                            <p className="mt-1 text-xs text-rose font-bold">
                              Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}
                            </p>
                          )}
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
                          <Info label="Delivery Date" value={order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"} />
                        </div>
                      ) : (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          <Info label="Price"   value={formatPrice(order.price)} />
                          <Info label="Phone"   value={getCustomerPhone(order) || "N/A"} />
                          <Info label="Delivery Date" value={order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"} />
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
              {deliveredOrdersTotalPages > 1 && (
                <div className="p-5 border-t border-plum/10 bg-white">
                  <Pagination current={deliveredOrdersPage} total={deliveredOrdersTotalPages} onChange={setDeliveredOrdersPage} />
                </div>
              )}
            </div>
          )}
        </div>
      )}



      {/* ── Feedback Tab ── */}
      {activeTab === "feedback" && (
        <div id="section-feedback" className="card p-5 mt-6 scroll-mt-6 animate-fadeUp">
          <h2 className="font-display text-2xl font-bold text-plum">Recent Feedback</h2>
          <div className="mt-4 grid gap-3">
            {feedback.length ? (
              <>
                {pagedFeedback.map((item) => (
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
                ))}
                {feedbackTotalPages > 1 && (
                  <div className="p-3 bg-white">
                    <Pagination current={feedbackPage} total={feedbackTotalPages} onChange={setFeedbackPage} />
                  </div>
                )}
              </>
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
