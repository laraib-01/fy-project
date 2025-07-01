import React from "react";
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("educonnect_token") !== null;
  const userRole = localStorage.getItem("educonnect_role");
  const hasActiveSubscription =
    localStorage.getItem("educonnect_hasActiveSubscription") === "true";

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  // Redirect School_Admin to /subscription if no active subscription
  if (userRole === "School_Admin" && !hasActiveSubscription) {
    return <Navigate to="/subscription" />;
  }

  return children;
};
