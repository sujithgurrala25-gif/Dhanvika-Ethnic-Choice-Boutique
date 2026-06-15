import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Heart,
  LogOut,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserRound,
  Phone,
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

const tabs = [
  { id: "browse", label: "Browse Products", icon: ShoppingBag },
  { id: "cart", label: "Cart", icon: ShoppingCart },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "profile", label: "Profile", icon: UserRound },
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

  const [products, setProducts] = useState([]);
  const [productDesigns, setProductDesigns] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartPhone, setCartPhone] = useState(user?.phone || "");
  const [cartPhoneError, setCartPhoneError] = useState("");
  const [wishlistPhone, setWishlistPhone] = useState(user?.phone || "");
  const [wishlistPhoneError, setWishlistPhoneError] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        const [prodData, designData, cartData, wishData, ordData] =
          await Promise.all([
            fetchProducts(),
            fetchProductDesigns(),
            fetchCart(),
            fetchWishlist(),
            fetchOrders(),
          ]);
        const normalizedProducts = (prodData.products || []).map(
          normalizeProduct,
        );
        const productsById = new Map(
          normalizedProducts.map((product) => [product.id, product]),
        );

        setProducts(normalizedProducts);
        setProductDesigns(designData.designs || []);
        setCart(
          (cartData.cart || []).map((product) =>
            normalizeProduct(productsById.get(product.id) || product),
          ),
        );
        setWishlist(
          (wishData.wishlist || []).map((product) =>
            normalizeProduct(productsById.get(product.id) || product),
          ),
        );
        setOrders(ordData.orders || []);
        setSelectedProduct(normalizedProducts[0] || null);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleViewDetails(product) {
    setSelectedProduct(product);
    setActiveTab("details");
  }

  async function handleAddToCart(product) {
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
    try {
      const data = await toggleWishlistApi(product.id);
      setWishlist((data.wishlist || []).map(normalizeProduct));
    } catch (err) {
      console.error("Wishlist toggle error:", err);
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
    const digits = cartPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setCartPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setCartPhoneError("");

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
          })
        )
      );
      await clearCartApi();
      setCart([]);
      const ordData = await fetchOrders();
      setOrders(ordData.orders || []);
      setActiveTab("orders");
      alert("Your order has been placed successfully!");
    } catch (err) {
      console.error("Place order error:", err);
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
    const digits = wishlistPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setWishlistPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setWishlistPhoneError("");

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
          })
        )
      );

      await Promise.all(wishlist.map((item) => toggleWishlistApi(item.id)));
      setWishlist([]);

      const ordData = await fetchOrders();
      setOrders(ordData.orders || []);
      setActiveTab("orders");
      alert("Your order has been placed successfully!");
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

  if (loading) {
    return (
      <section className="page-shell flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner label="Loading dashboard" />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-8 grid gap-5 rounded-lg bg-white p-5 shadow-aura lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">
            User Dashboard
          </p>
          <h1 className="section-title">Welcome, {user.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
            Browse boutique products, save favorites, manage your cart, and
            track custom stitching orders.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/select-outfit" className="btn-primary">
            <Sparkles size={17} />
            Start Designing
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
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

      {activeTab === "browse" && (
        <DashboardPanel title="Browse Boutique Products">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inCart={isInCart(product.id)}
                inWishlist={isInWishlist(product.id)}
                onDetails={handleViewDetails}
                onCart={handleAddToCart}
                onWishlist={handleWishlist}
              />
            ))}
          </div>
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
          {selectedProduct ? (
            selectedDesigns.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {selectedDesigns.map((design) => (
                  <ProductDesignCard
                    key={design.id}
                    design={design}
                    inCart={isInCart(design.id)}
                    inWishlist={isInWishlist(design.id)}
                    onCart={handleAddToCart}
                    onWishlist={handleWishlist}
                  />
                ))}
              </div>
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
                items={cart}
                actionLabel="Remove"
                onAction={(product) => handleRemoveFromCart(product.id)}
              />
              <div className="mt-8 flex flex-col items-end gap-3 border-t border-plum/10 pt-6">
                <div className="w-full max-w-sm mb-2 text-left">
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    <span className="flex items-center gap-2">
                      <Phone size={15} />
                      WhatsApp Mobile Number
                    </span>
                    <input
                      className="input-field"
                      type="tel"
                      value={cartPhone}
                      onChange={(e) => {
                        setCartPhone(e.target.value);
                        setCartPhoneError("");
                      }}
                      placeholder="e.g. 9876543210"
                      required
                      maxLength={15}
                    />
                  </label>
                  {cartPhoneError && (
                    <p className="mt-2 rounded-md bg-rose/10 px-4 py-2 text-xs font-semibold text-rose">
                      {cartPhoneError}
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
                items={wishlist}
                actionLabel="Remove Wishlist"
                onAction={(product) => handleWishlist(product)}
              />
              <div className="mt-8 flex flex-col items-end gap-3 border-t border-plum/10 pt-6">
                <div className="w-full max-w-sm mb-2 text-left">
                  <label className="grid gap-2 text-sm font-bold text-plum">
                    <span className="flex items-center gap-2">
                      <Phone size={15} />
                      WhatsApp Mobile Number
                    </span>
                    <input
                      className="input-field"
                      type="tel"
                      value={wishlistPhone}
                      onChange={(e) => {
                        setWishlistPhone(e.target.value);
                        setWishlistPhoneError("");
                      }}
                      placeholder="e.g. 9876543210"
                      required
                      maxLength={15}
                    />
                  </label>
                  {wishlistPhoneError && (
                    <p className="mt-2 rounded-md bg-rose/10 px-4 py-2 text-xs font-semibold text-rose">
                      {wishlistPhoneError}
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
                      {order.id}
                    </p>
                    <h3 className="font-display text-2xl font-bold text-plum">
                      {order.outfit?.title || order.outfit_type}
                    </h3>
                    <p className="mt-1 text-sm text-ink/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
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

      {activeTab === "profile" && (
        <DashboardPanel title="Profile">
          <div className="card max-w-2xl p-6">
            <span className="mb-5 grid h-16 w-16 place-items-center rounded-md bg-lavender text-plum">
              <UserRound size={30} />
            </span>
            <div className="grid gap-3">
              <Info label="Name" value={user.name} />
              <Info label="Email" value={user.email} />
              <Info label="Role" value={user.role || "user"} />
              <Info label="Cart Items" value={cart.length} />
              <Info label="Wishlist Items" value={wishlist.length} />
              <Info label="Orders" value={orders.length} />
            </div>
          </div>
        </DashboardPanel>
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

function ProductCard({ product, onDetails }) {
  return (
    <article className="card group overflow-hidden">
      <img
        src={product.image || product.image_url}
        alt={product.name}
        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
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

function ProductDesignCard({ design, inCart, inWishlist, onCart, onWishlist }) {
  return (
    <article className="card group overflow-hidden">
      <img
        src={design.image || design.image_url}
        alt={design.name}
        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
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
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => onCart(design)}
            className={inCart ? "btn-primary !bg-emerald-600 hover:!bg-emerald-700" : "btn-primary"}
          >
            <ShoppingCart size={17} />
            {inCart ? "Added to Cart" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={() => onWishlist(design)}
            className="btn-secondary"
          >
            <Heart size={17} fill={inWishlist ? "currentColor" : "none"} />
            {inWishlist ? "Saved" : "Wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ItemGrid({ items, actionLabel, onAction }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.id} className="card overflow-hidden flex flex-col justify-between">
          <div>
            <img
              src={item.image || item.image_url}
              alt={item.name}
              className="h-44 w-full object-cover"
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
          <div className="p-5 pt-4">
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
