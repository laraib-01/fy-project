import React from "react";
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("educonnect_token") !== null;

  const userRole = localStorage.getItem("educonnect_role");

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  return children;
};
