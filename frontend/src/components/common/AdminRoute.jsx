import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
