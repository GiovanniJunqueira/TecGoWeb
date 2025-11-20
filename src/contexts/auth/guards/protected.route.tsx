import SkeletonPageComponent from "@/components/loader/skeleton.page.component";
import { useAuth } from "@/contexts/auth/auth.context";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SkeletonPageComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
