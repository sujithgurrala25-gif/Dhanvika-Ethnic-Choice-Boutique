import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Eye,
  Heart,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Phone,
  ChevronLeft,
  X,
} from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/pricing.js";
import { fetchProducts } from "../services/productService.js";
import { fetchProductDesigns } from "../services/productDesignService.js";
import { fetchOrders, createOrder, deleteOrder } from "../services/orderService.js";
import {
  fetchCart,
  fetchWishlist,
  addToCartApi,
  removeFromCartApi,
  toggleWishlistApi,
  clearCartApi,
} from "../services/userService.js";
import Pagination from "../components/Pagination.jsx";


const tabs = [
  { id: "browse", label: "Browse Products", icon: ShoppingBag },
  { id: "wishlist", label: "Wishlist", icon: Heart },
];


function normalizeProduct(product) {
  return {
    ...product,
    image: product.image_url || product.image,
  };
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [productDesigns, setProductDesigns] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "browse";
  const setActiveTab = (tabId) => setSearchParams({ tab: tabId });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartDeliveryDate, setCartDeliveryDate] = useState("");
  const [cartDeliveryDateError, setCartDeliveryDateError] = useState("");
  const [wishlistDeliveryDate, setWishlistDeliveryDate] = useState("");
  const [wishlistDeliveryDateError, setWishlistDeliveryDateError] = useState("");
  const CART_PAGE_SIZE = 4;
  const BROWSE_PAGE_SIZE = 8;
  const [cartPage, setCartPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [browsePage, setBrowsePage] = useState(1);
  const [designsPage, setDesignsPage] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        if (user) {
          const [prodData, designData, cartData, wishData, ordData] =
            await Promise.all([
              fetchProducts(),
              fetchProductDesigns(),
              fetchCart(),
              fetchWishlist(),
              fetchOrders(),
            ]);
          const normalizedProducts = (prodData.products || []).map(normalizeProduct);
          const productsById = new Map(normalizedProducts.map((p) => [p.id, p]));
          setProducts(normalizedProducts);
          setProductDesigns(designData.designs || []);
          setCart((cartData.cart || []).map((p) => normalizeProduct(productsById.get(p.id) || p)));
          setWishlist((wishData.wishlist || []).map((p) => normalizeProduct(productsById.get(p.id) || p)));
          setOrders(ordData.orders || []);
          setSelectedProduct(normalizedProducts[0] || null);
        } else {
          // Guest — load products + designs, no auth calls
          const [prodData, designData] = await Promise.all([
            fetchProducts(),
            fetchProductDesigns(),
          ]);
          const normalizedProducts = (prodData.products || []).map(normalizeProduct);
          setProducts(normalizedProducts);
          setProductDesigns(designData.designs || []);
          setSelectedProduct(normalizedProducts[0] || null);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [user]);



  function requireLogin() {
    navigate("/login", { state: { from: location.pathname + location.search } });
  }

  function handleViewDetails(product) {
    setSelectedProduct(product);
    setDesignsPage(1);
    setActiveTab("details");
  }

  async function handleAddToCart(product) {
    if (!user) { requireLogin(); return; }
    try {
      const data = await addToCartApi(product.id);
      setCart((data.cart || []).map(normalizeProduct));
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  }

  async function handleRemoveFromCart(productId) {
    try {
      const data = await removeFromCartApi(productId);
      setCart((data.cart || []).map(normalizeProduct));
    } catch (err) {
      console.error("Remove from cart error:", err);
    }
  }

  async function handleWishlist(product) {
    if (!user) { requireLogin(); return; }
    try {
      const data = await toggleWishlistApi(product.id);
      setWishlist((data.wishlist || []).map(normalizeProduct));
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  }

  async function handlePlaceDirectOrder(design) {
    if (!user) { requireLogin(); return; }
    const defaultPhone = user?.phone || "";
    const digits = defaultPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("Please update your mobile number in your Profile first.");
      return;
    }

    const formattedPhone = digits.length === 10 ? `91${digits}` : digits;

    const todayStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateInput = window.prompt("Please enter your preferred delivery date (YYYY-MM-DD):", todayStr);
    if (dateInput === null) return;
    if (!dateInput.trim()) {
      alert("Preferred delivery date is required.");
      return;
    }

    try {
      setLoading(true);
      await createOrder({
        outfit_type: design.id,
        outfit_title: design.name,
        fabric_image: design.image || design.image_url || null,
        total_price: design.price,
        status: "Order Received",
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: formattedPhone,
        deliveryDate: dateInput.trim(),
      });

      const ordData = await fetchOrders();
      setOrders(ordData.orders || []);
      setActiveTab("orders");
      alert("Your order has been placed successfully!");
    } catch (err) {
      console.error("Place direct order error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function isInCart(productId) {
    return cart.some((item) => item.id === productId);
  }

  function isInWishlist(productId) {
    return wishlist.some((item) => item.id === productId);
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const wishlistTotal = wishlist.reduce((sum, item) => sum + (item.price || 0), 0);

  async function handlePlaceCartOrder() {
    if (!user) { requireLogin(); return; }
    const defaultPhone = user?.phone || "";
    const digits = defaultPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("Please update your mobile number in your Profile first.");
      return;
    }

    if (!cartDeliveryDate) {
      setCartDeliveryDateError("Please select your preferred delivery date.");
      return;
    }
    setCartDeliveryDateError("");

    try {
      setLoading(true);
      const formattedPhone = digits.length === 10 ? `91${digits}` : digits;
      await Promise.all(
        cart.map((item) =>
          createOrder({
            outfit_type: item.id,
            outfit_title: item.name,
            fabric_image: item.image,
            total_price: item.price,
            status: "Order Received",
            customer_name: user.name,
            customer_email: user.email,
            customer_phone: formattedPhone,
            deliveryDate: cartDeliveryDate,
          })
        )
      );
      await clearCartApi();
      setCart([]);
      setCartDeliveryDate("");
      const ordData = await fetchOrders();
      setOrders(ordData.orders || []);
      setActiveTab("orders");
      alert("Your orders have been placed successfully!");
    } catch (err) {
      console.error("Place order error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceIndividualCartOrder(item) {
    if (!user) { requireLogin(); return; }

    const defaultPhone = user?.phone || "";
    const digits = defaultPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("Please update your mobile number in your Profile first.");
      return;
    }
    const formattedPhone = digits.length === 10 ? `91${digits}` : digits;

    let deliveryDate = cartDeliveryDate;
    if (!deliveryDate) {
      const today = new Date();
      today.setDate(today.getDate() + 7);
      const todayStr = today.toISOString().split("T")[0];
      const dateInput = window.prompt("Please enter your preferred delivery date (YYYY-MM-DD) to place this order:", todayStr);
      if (dateInput === null) return;
      if (!dateInput.trim()) {
        alert("Preferred delivery date is required.");
        return;
      }
      deliveryDate = dateInput.trim();
    }

    try {
      setLoading(true);
      await createOrder({
        outfit_type: item.id,
        outfit_title: item.name,
        fabric_image: item.image,
        total_price: item.price,
        status: "Order Received",
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: formattedPhone,
        deliveryDate: deliveryDate,
      });

      const cartData = await removeFromCartApi(item.id);
      setCart((cartData.cart || []).map(normalizeProduct));

      const ordData = await fetchOrders();
      setOrders(ordData.orders || []);
      setActiveTab("orders");
      alert("Your order has been placed successfully!");
    } catch (err) {
      console.error("Place individual cart order error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder(orderId) {
    const confirmed = window.confirm("Are you sure you want to cancel this order? This cannot be undone.");
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlaceWishlistOrder() {
    if (!user) { requireLogin(); return; }
    const defaultPhone = user?.phone || "";
    const digits = defaultPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("Please update your mobile number in your Profile first.");
      return;
    }

    if (!wishlistDeliveryDate) {
      setWishlistDeliveryDateError("Please select your preferred delivery date.");
      return;
    }
    setWishlistDeliveryDateError("");

    try {
      setLoading(true);
      const formattedPhone = digits.length === 10 ? `91${digits}` : digits;
      await Promise.all(
        wishlist.map((item) =>
          createOrder({
            outfit_type: item.id,
            outfit_title: item.name,
            fabric_image: item.image,
            total_price: item.price,
            status: "Order Received",
            customer_name: user.name,
            customer_email: user.email,
            customer_phone: formattedPhone,
            deliveryDate: wishlistDeliveryDate,
          })
        )
      );

      await Promise.all(wishlist.map((item) => toggleWishlistApi(item.id)));
      setWishlist([]);
      setWishlistDeliveryDate("");

      const ordData = await fetchOrders();
      setOrders(ordData.orders || []);
      setActiveTab("orders");
      alert("Your orders have been placed successfully!");
    } catch (err) {
      console.error("Place order from wishlist error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedDesigns = selectedProduct
    ? productDesigns.filter(
        (design) =>
          design.parent_product_id === selectedProduct.id ||
          design.category === selectedProduct.category,
      )
    : [];

  const cartTotalPages = Math.ceil(cart.length / CART_PAGE_SIZE);
  const pagedCart = cart.slice((cartPage - 1) * CART_PAGE_SIZE, cartPage * CART_PAGE_SIZE);

  const wishlistTotalPages = Math.ceil(wishlist.length / CART_PAGE_SIZE);
  const pagedWishlist = wishlist.slice((wishlistPage - 1) * CART_PAGE_SIZE, wishlistPage * CART_PAGE_SIZE);

  const browseTotalPages = Math.ceil(products.length / BROWSE_PAGE_SIZE);
  const pagedProducts = products.slice((browsePage - 1) * BROWSE_PAGE_SIZE, browsePage * BROWSE_PAGE_SIZE);

  const designsTotalPages = Math.ceil(selectedDesigns.length / BROWSE_PAGE_SIZE);
  const pagedDesigns = selectedDesigns.slice((designsPage - 1) * BROWSE_PAGE_SIZE, designsPage * BROWSE_PAGE_SIZE);

  if (loading) {
    return (
      <section className="page-shell flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner label="Loading dashboard" />
      </section>
    );
  }

  return (
    <section className="page-shell">
      {(activeTab === "browse" || activeTab === "wishlist") && (
        <div className="mb-6 grid gap-4 rounded-lg bg-white p-4 shadow-aura lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-gold">
              {user ? "User Dashboard" : "Browse Products"}
            </p>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-plum">
              {user ? `Welcome, ${user.name}` : "Boutique Products"}
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-ink/65">
              {user
                ? "Browse boutique products, save favorites, manage your cart, and track custom stitching orders."
                : "Browse our boutique products. Login to add to cart, wishlist, or place an order."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {user ? (
              <Link to="/select-outfit" className="btn-primary py-2 px-4 text-sm">
                <Sparkles size={16} />
                Start Designing
              </Link>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-4 text-sm">
                Login to Order
              </Link>
            )}
          </div>
        </div>
      )}

      {user && (activeTab === "browse" || activeTab === "wishlist") && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "bg-plum text-white shadow-aura"
                    : "bg-white text-plum shadow-sm hover:bg-lavender/60"
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "browse" && (
        <DashboardPanel title="Browse Boutique Products">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pagedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inCart={isInCart(product.id)}
                inWishlist={isInWishlist(product.id)}
                onDetails={handleViewDetails}
                onCart={handleAddToCart}
                onWishlist={handleWishlist}
                onImageClick={(url, title, cat) => setPreviewImage({ url, title, category: cat })}
              />
            ))}
          </div>
          {browseTotalPages > 1 && (
            <Pagination current={browsePage} total={browseTotalPages} onChange={setBrowsePage} />
          )}
        </DashboardPanel>
      )}

      {activeTab === "details" && (
        <DashboardPanel
          title={
            selectedProduct
              ? `${selectedProduct.category || selectedProduct.name} Designs`
              : "View Products"
          }
        >
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setActiveTab("browse")}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back to Products
            </button>
          </div>
          {selectedProduct ? (
            selectedDesigns.length ? (
              <>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {pagedDesigns.map((design) => (
                    <ProductDesignCard
                      key={design.id}
                      design={design}
                      inCart={isInCart(design.id)}
                      inWishlist={isInWishlist(design.id)}
                      onCart={handleAddToCart}
                      onWishlist={handleWishlist}
                      onOrder={handlePlaceDirectOrder}
                      onImageClick={(url, title, cat) => setPreviewImage({ url, title, category: cat })}
                    />
                  ))}
                </div>
                {designsTotalPages > 1 && (
                  <Pagination current={designsPage} total={designsTotalPages} onChange={setDesignsPage} />
                )}
              </>
            ) : (
              <EmptyState
                title="No designs uploaded"
                message={`Admin can add ${selectedProduct.category || selectedProduct.name} designs from the dashboard.`}
              />
            )
          ) : (
            <EmptyState
              title="No product selected"
              message="Choose a product first to view details."
            />
          )}
        </DashboardPanel>
      )}

      {activeTab === "cart" && (
        <DashboardPanel title="Add To Cart">
          {cart.length ? (
            <>
              <ItemGrid
                items={pagedCart}
                actionLabel="Remove"
                onAction={(product) => handleRemoveFromCart(product.id)}
                orderLabel="Order Now"
                onOrder={handlePlaceIndividualCartOrder}
                onImageClick={(url, title, cat) => setPreviewImage({ url, title, category: cat })}
              />
              {cartTotalPages > 1 && (
                <Pagination current={cartPage} total={cartTotalPages} onChange={setCartPage} />
              )}
              <div className="mt-8 flex flex-col items-end gap-3 border-t border-plum/10 pt-6">
                <div className="w-full max-w-sm mb-2 text-left">
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    <span>Preferred Delivery Date</span>
                    <input
                      className="input-field"
                      type="date"
                      value={cartDeliveryDate}
                      onChange={(e) => {
                        setCartDeliveryDate(e.target.value);
                        setCartDeliveryDateError("");
                      }}
                      required
                    />
                  </label>
                  {cartDeliveryDateError && (
                    <p className="mt-2 rounded-md bg-rose/10 px-4 py-2 text-xs font-semibold text-rose">
                      {cartDeliveryDateError}
                    </p>
                  )}
                </div>
                <p className="text-xl font-bold text-plum">
                  Total Price: <span className="text-rose">{formatPrice(cartTotal)}</span>
                </p>
                <button
                  type="button"
                  onClick={handlePlaceCartOrder}
                  className="btn-primary"
                >
                  Place Order
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              title="Cart is empty"
              message="Products you add to cart will appear here."
              actionLabel="Browse Products"
              onClick={() => setActiveTab("browse")}
            />
          )}
        </DashboardPanel>
      )}

      {activeTab === "wishlist" && (
        <DashboardPanel title="Wishlist">
          {wishlist.length ? (
            <>
              <ItemGrid
                items={pagedWishlist}
                actionLabel="Remove Wishlist"
                onAction={(product) => handleWishlist(product)}
                onImageClick={(url, title, cat) => setPreviewImage({ url, title, category: cat })}
              />
              {wishlistTotalPages > 1 && (
                <Pagination current={wishlistPage} total={wishlistTotalPages} onChange={setWishlistPage} />
              )}
              <div className="mt-8 flex flex-col items-end gap-3 border-t border-plum/10 pt-6">
                <div className="w-full max-w-sm mb-2 text-left">
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    <span>Preferred Delivery Date</span>
                    <input
                      className="input-field"
                      type="date"
                      value={wishlistDeliveryDate}
                      onChange={(e) => {
                        setWishlistDeliveryDate(e.target.value);
                        setWishlistDeliveryDateError("");
                      }}
                      required
                    />
                  </label>
                  {wishlistDeliveryDateError && (
                    <p className="mt-2 rounded-md bg-rose/10 px-4 py-2 text-xs font-semibold text-rose">
                      {wishlistDeliveryDateError}
                    </p>
                  )}
                </div>
                <p className="text-xl font-bold text-plum">
                  Total Price: <span className="text-rose">{formatPrice(wishlistTotal)}</span>
                </p>
                <button
                  type="button"
                  onClick={handlePlaceWishlistOrder}
                  className="btn-primary"
                >
                  Place Order
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              title="Wishlist is empty"
              message="Save favorite boutique products to view them later."
            />
          )}
        </DashboardPanel>
      )}

      {activeTab === "orders" && (
        <DashboardPanel title="My Orders">
          {orders.length ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="card grid gap-4 overflow-hidden p-5 md:grid-cols-[140px_1fr_auto] md:items-center"
                >
                  <img
                    src={order.fabric_image || order.fabricImage}
                    alt="Fabric"
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase text-gold">
                      {order.orderNum || order.id}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-plum">
                      {order.outfit?.title || order.outfit_type}
                    </h3>
                    <p className="mt-1 text-sm text-ink/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.deliveryDate && (
                      <p className="mt-1 text-xs text-rose font-bold">
                        Delivery Date: {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-left md:text-right flex flex-col items-start md:items-end gap-2">
                    <p className="rounded-md bg-lavender px-3 py-2 text-sm font-bold text-plum">
                      {order.status}
                    </p>
                    <p className="mt-1 font-bold text-rose">
                      {formatPrice(order.price)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Link
                        to={`/order-output/${order.id}`}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        View Order
                      </Link>
                      {order.createdAt && ((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24) <= 3) && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          className="btn-primary bg-rose/90 hover:bg-rose text-white text-xs py-1.5 px-3"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No orders yet"
              message="Your confirmed stitching orders will appear here."
              actionLabel="Start Designing"
              actionTo="/select-outfit"
            />
          )}
        </DashboardPanel>
      )}



      {/* Premium Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-all duration-300 cursor-zoom-out animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          {/* Floating Close Button */}
          <button
            type="button"
            className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
            onClick={() => setPreviewImage(null)}
          >
            <X size={24} />
          </button>

          {/* Image Container */}
          <div
            className="relative flex flex-col items-center justify-center gap-4 transition-transform duration-300 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.url}
              alt={previewImage.title || "Preview"}
              className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10"
            />
            {previewImage.title && (
              <div className="text-center bg-black/40 px-6 py-3 rounded-lg backdrop-blur-sm border border-white/5 max-w-[80vw]">
                <p className="font-display text-xl font-bold text-white leading-tight">{previewImage.title}</p>
                {previewImage.category && (
                  <p className="text-xs uppercase tracking-wider text-gold font-bold mt-1.5">{previewImage.category}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function DashboardPanel({ title, children }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold text-plum">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ProductCard({ product, onDetails, onImageClick }) {
  const imageUrl = product.image || product.image_url;
  return (
    <article className="card group overflow-hidden">
      <img
        src={imageUrl}
        alt={product.name}
        onClick={() => onImageClick && onImageClick(imageUrl, product.name, product.category)}
        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 cursor-zoom-in"
      />
      <div className="p-5">
        <p className="text-xs font-bold uppercase text-gold">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-2xl font-bold text-plum">
          {product.name}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          {product.description}
        </p>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => onDetails(product)}
            className="btn-secondary"
          >
            <Eye size={17} />
            View Products
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductDesignCard({ design, inCart, inWishlist, onCart, onWishlist, onOrder, onImageClick }) {
  const imageUrl = design.image || design.image_url;
  return (
    <article className="card group overflow-hidden">
      <img
        src={imageUrl}
        alt={design.name}
        onClick={() => onImageClick && onImageClick(imageUrl, design.name, design.category)}
        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 cursor-zoom-in"
      />
      <div className="p-5">
        <p className="text-xs font-bold uppercase text-gold">
          {design.category}
        </p>
        <h3 className="mt-1 font-display text-2xl font-bold text-plum">
          {design.name}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          {design.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-rose">
            {formatPrice(design.price)}
          </p>
          <p className="text-xs font-bold uppercase text-ink/50">
            Stock: {design.stock}
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onOrder(design)}
            className="btn-primary w-full"
          >
            <ShoppingBag size={17} />
            Order Now
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onCart(design)}
              className={inCart ? "btn-secondary !bg-emerald-50 !border-emerald-500 !text-emerald-700" : "btn-secondary"}
            >
              <ShoppingCart size={16} />
              {inCart ? "Added" : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={() => onWishlist(design)}
              className="btn-secondary"
            >
              <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
              {inWishlist ? "Saved" : "Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ItemGrid({ items, actionLabel, onAction, onOrder, orderLabel, onImageClick }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.id} className="card overflow-hidden flex flex-col justify-between">
          <div>
            <img
              src={item.image || item.image_url}
              alt={item.name}
              onClick={() => onImageClick && onImageClick(item.image || item.image_url, item.name, item.category)}
              className="h-44 w-full object-cover cursor-zoom-in hover:scale-105 transition-all duration-300"
            />
            <div className="p-5 pb-0">
              <p className="text-xs font-bold uppercase text-gold">
                {item.category}
              </p>
              <h3 className="font-display text-xl font-bold text-plum">
                {item.name}
              </h3>
              <p className="mt-2 font-bold text-rose">
                {formatPrice(item.price)}
              </p>
            </div>
          </div>
          <div className="p-5 pt-4 flex flex-col gap-2">
            {onOrder && (
              <button
                type="button"
                onClick={() => onOrder(item)}
                className="btn-primary w-full flex items-center justify-center gap-1.5"
              >
                <ShoppingBag size={16} />
                {orderLabel || "Order Now"}
              </button>
            )}
            <button
              type="button"
              onClick={() => onAction(item)}
              className="btn-secondary w-full"
            >
              {actionLabel}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md bg-cream px-4 py-3">
      <p className="text-xs font-bold uppercase text-gold">{label}</p>
      <p className="mt-1 font-bold text-plum">{value}</p>
    </div>
  );
}

