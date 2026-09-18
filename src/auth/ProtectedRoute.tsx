import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "./AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-deep text-white flex items-center justify-center shadow-md">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#EFF6F2]">
            <path
              d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-soft font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-teal-deep" />
          <span>Verifying authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated user to login with redirect param
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // If user role is not allowed on this route, redirect to their role-specific home
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === "doctor") {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
