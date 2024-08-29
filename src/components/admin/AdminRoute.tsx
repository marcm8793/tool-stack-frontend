import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAdminAccess();

  if (loading) return <LoadingSpinner />;
  if (!isAdmin) return <Navigate to="/" />;

  return <>{children}</>;
};

export default AdminRoute;
