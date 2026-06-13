import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, XCircle } from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/pricing.js";
import { fetchOrders, deleteOrder } from "../services/orderService.js";

export default function PreviousOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOrders();
        const sorted = [...(data.orders || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCancelOrder(orderId) {
    const confirmed = window.confirm("Are you sure you want to cancel this order? This cannot be undone.");
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      setError(err.message || "Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="page-shell flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner label="Loading orders" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-shell">
        <p className="rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{error}</p>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="page-shell">
        <EmptyState
          title="No previous orders"
          message="Your confirmed custom stitching orders will appear here."
          actionLabel="Start Designing"
          actionTo="/select-outfit"
        />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Previous Orders</p>
        <h1 className="section-title">Your stitching history</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {orders.map((order) => {
          const isProduct = order.is_product_order || !order.measurements || Object.keys(order.measurements).length === 0;
          return (
            <article key={order.id} className="card overflow-hidden">
              <div className="grid sm:grid-cols-[180px_1fr]">
                {isProduct ? (
                  <div className="flex items-center justify-center bg-cream/40 overflow-hidden">
                    <img
                      src={order.fabric_image || order.outfit?.image}
                      alt={order.outfit?.title || "Product"}
                      className="h-40 w-full object-cover sm:h-full"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-1">
                    <img
                      src={order.outfit?.image || order.fabric_image}
                      alt={order.outfit?.title}
                      className="h-40 w-full object-cover sm:h-full"
                    />
                    <img
                      src={order.fabric_image}
                      alt="Fabric"
                      className="h-40 w-full object-cover sm:hidden"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-plum">
                        {order.outfit?.title || order.outfit_type}
                      </h2>
                      <p className="mt-1 text-sm text-ink/58">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {isProduct && (
                        <span className="mt-1.5 inline-block rounded bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                          Ready-made Product
                        </span>
                      )}
                    </div>
                    <span className="h-fit rounded-md bg-lavender px-3 py-2 text-xs font-bold text-plum">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-rose">
                    {formatPrice(order.price)}
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/order-output/${order.id}`}
                      className="btn-secondary flex-1"
                    >
                      <Eye size={17} />
                      View Order
                    </Link>
                    {order.createdAt &&
                      (new Date() - new Date(order.createdAt)) /
                        (1000 * 60 * 60 * 24) <=
                        3 && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order.id)}
                          className="btn-primary bg-rose/90 hover:bg-rose text-white flex-1"
                        >
                          <XCircle size={17} />
                          Cancel Order
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
