import SkeletonPageComponent from "@/components/loader/skeleton.page.component";
import { useAuth } from "@/contexts/auth/auth.context";
import {
  ALWAYS_ALLOWED_ROUTES,
  ROUTE_PERMISSIONS,
  getStaffLandingPath,
  hasPermission,
} from "@/lib/permissions";
import { Navigate, Outlet, matchPath, useLocation } from "react-router-dom";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SkeletonPageComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "MASTER") {
    return <Navigate to="/master/escolas/nova" replace />;
  }

  if (user?.role === "STAFF") {
    const isAlwaysAllowed = ALWAYS_ALLOWED_ROUTES.some((pattern) =>
      matchPath(pattern, location.pathname)
    );

    if (!isAlwaysAllowed) {
      const matched = ROUTE_PERMISSIONS.find((entry) =>
        matchPath(entry.pattern, location.pathname)
      );

      if (!matched || !hasPermission(user, matched.permission)) {
        const fallback = getStaffLandingPath(user.permissions ?? []);
        if (location.pathname !== fallback) {
          return <Navigate to={fallback} replace />;
        }
      }
    }
  }

  return <Outlet />;
};
