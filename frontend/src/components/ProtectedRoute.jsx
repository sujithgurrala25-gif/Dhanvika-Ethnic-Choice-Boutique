import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  let userRole = user.role || "user";
  if (userRole === "customer") {
    userRole = "user";
  }
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to={userRole === "admin" ? "/admin-dashboard" : "/user-dashboard"}
        replace
      />
    );
  }

  return children;
}
