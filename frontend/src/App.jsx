import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Gallery from "./pages/Gallery.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import SelectOutfit from "./pages/SelectOutfit.jsx";
import UploadFabric from "./pages/UploadFabric.jsx";
import Measurements from "./pages/Measurements.jsx";
import Customize from "./pages/Customize.jsx";
import Preview from "./pages/Preview.jsx";
import PlaceOrder from "./pages/PlaceOrder.jsx";
import OrderOutput from "./pages/OrderOutput.jsx";
import PreviousOrders from "./pages/PreviousOrders.jsx";
import Feedback from "./pages/Feedback.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminCustomers from "./pages/AdminCustomers.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-cream text-ink">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-outfit"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <SelectOutfit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-fabric"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UploadFabric />
              </ProtectedRoute>
            }
          />
          <Route
            path="/measurements"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Measurements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customize"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Customize />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Preview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/place-order"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <PlaceOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-output/:orderId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <OrderOutput />
              </ProtectedRoute>
            }
          />
          <Route
            path="/previous-orders"
            element={
              <Navigate to="/user-dashboard?tab=orders" replace />
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Navigate to="/admin-dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-customers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
