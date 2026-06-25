import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Mail, MessageCircle, Phone, ShoppingBag, Trash2, Users } from "lucide-react";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { deleteUserApi, fetchUsers } from "../services/userService.js";
import { fetchOrders } from "../services/orderService.js";
import { formatPrice } from "../utils/pricing.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { normalizeWhatsAppPhone } from "../utils/whatsapp.js";

export default function AdminCustomers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const CUSTOMERS_PAGE_SIZE = 10;
  const [customersPage, setCustomersPage] = useState(1);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await deleteUserApi(customerToDelete.id);
      setCustomerToDelete(null);
      await loadData();
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

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

  const customersTotalPages = Math.ceil(customerStats.length / CUSTOMERS_PAGE_SIZE);
  const pagedCustomerStats = customerStats.slice(
    (customersPage - 1) * CUSTOMERS_PAGE_SIZE,
    customersPage * CUSTOMERS_PAGE_SIZE
  );

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
          <>
            <div className="divide-y divide-plum/10">
              {pagedCustomerStats.map((customer) => (
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

                  <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                    {customer.phone ? (
                      <a
                        href={`https://wa.me/${normalizeWhatsAppPhone(customer.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white w-full md:w-auto justify-center animate-in fade-in duration-200"
                      >
                        <MessageCircle size={15} />
                        WhatsApp Chat
                      </a>
                    ) : (
                      <span className="text-xs text-ink/40 font-semibold italic mr-2 animate-in fade-in duration-200">No phone contact</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCustomerToDelete(customer)}
                      className="inline-flex items-center justify-center p-2.5 rounded-md border border-rose/30 bg-rose/5 text-rose hover:bg-rose hover:text-white transition-all duration-200 animate-in fade-in duration-200"
                      title="Delete Customer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {customersTotalPages > 1 && (
              <div className="p-5 border-t border-plum/10 bg-white">
                <Pagination
                  current={customersPage}
                  total={customersTotalPages}
                  onChange={setCustomersPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-sm text-ink/60">No customer accounts registered yet.</div>
        )}
      </div>

      {/* Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum/50 backdrop-blur-sm transition-all duration-300">
          <div className="card w-full max-w-md overflow-hidden bg-white p-6 shadow-aura animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose mb-4">
              <AlertTriangle size={28} className="shrink-0" />
              <h3 className="font-display text-xl font-bold text-plum">Delete Customer Account</h3>
            </div>
            
            <p className="text-sm text-ink/75 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-plum">{customerToDelete.name}</strong> ({customerToDelete.email})? 
              This action will permanently remove their registered customer profile. Their order history will remain preserved in the system database.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={deleting}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-rose px-5 py-3 text-sm font-bold text-white shadow-aura transition hover:-translate-y-0.5 hover:bg-rose/90 focus:outline-none focus:ring-4 focus:ring-rose/20"
              >
                {deleting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? "Deleting..." : "Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
