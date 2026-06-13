import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Phone, ShoppingBag, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchUsers } from "../services/userService.js";
import { fetchOrders } from "../services/orderService.js";
import { formatPrice } from "../utils/pricing.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function AdminCustomers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [usrData, ordData] = await Promise.all([
        fetchUsers(),
        fetchOrders(),
      ]);

      const usersList = usrData.users || [];
      const ordersList = ordData.orders || [];

      // Filter only users with role !== 'admin' (customers), deduplicating by email
      const seenEmails = new Set();
      const uniqueCustomers = [];
      usersList.forEach((u) => {
        if (u.role !== "admin" && u.email) {
          const emailLower = u.email.toLowerCase();
          if (!seenEmails.has(emailLower)) {
            seenEmails.add(emailLower);
            uniqueCustomers.push(u);
          }
        }
      });

      setCustomers(uniqueCustomers);
      setOrders(ordersList);
    } catch (err) {
      console.error("Error loading customer data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map user email to their orders, phone and total spending
  const customerStats = customers.map((customer) => {
    const customerOrders = orders.filter(
      (o) =>
        (o.customer_email || o.user_email)?.toLowerCase() === customer.email?.toLowerCase()
    );

    // Find the latest phone number from orders
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

  if (loading) {
    return (
      <section className="page-shell flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner label="Loading customer directory" />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">Admin Directory</p>
          <h1 className="section-title">Customer Database</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
            View profiles, track total order history, and directly contact registered boutique customers.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard")}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-lavender text-plum">
            <Users size={22} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink/60">Total Customers</p>
            <p className="font-display text-3xl font-bold text-plum">{customers.length}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-lavender text-plum">
            <ShoppingBag size={22} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink/60">Orders Placed</p>
            <p className="font-display text-3xl font-bold text-plum">{orders.length}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-lavender text-plum">
            <MessageCircle size={22} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink/60">Active Customers</p>
            <p className="font-display text-3xl font-bold text-plum">
              {customerStats.filter((c) => c.ordersCount > 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="card overflow-hidden">
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
                      href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white w-full md:w-auto justify-center"
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
    </section>
  );
}
