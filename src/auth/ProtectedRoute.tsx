import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "./AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = "/auth/login",
  children,
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  // Resolve effective user and token from state or immediate storage
  let effectiveUser = user;
  let effectiveToken = token;

  if (!effectiveUser || !effectiveToken) {
    try {
      const savedToken =
        sessionStorage.getItem("dental_auth_token") ||
        localStorage.getItem("dental_auth_token");
      const savedUserStr =
        sessionStorage.getItem("dental_auth_user") ||
        localStorage.getItem("dental_auth_user");
      if (savedToken && savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed) {
          parsed.role = (parsed.role?.toLowerCase() || "patient") as UserRole;
          effectiveUser = parsed;
          effectiveToken = savedToken;
        }
      }
    } catch {
      // ignore
    }
  }

  const effectiveAuth = Boolean(effectiveToken && effectiveUser);

  if (isLoading && !effectiveAuth) {
    return (
      <div className="min-h-screen bg-[#FAF7F6] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-deep text-white flex items-center justify-center shadow-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-7 h-7 text-[#FAF7F6]"
          >
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

  if (!effectiveAuth || !effectiveUser) {
    // Redirect unauthenticated user to registration or login with redirect param
    const targetUrl = `${location.pathname}${location.search || ""}`;
    return (
      <Navigate
        to={`${redirectTo}?redirect=${encodeURIComponent(targetUrl)}`}
        replace
      />
    );
  }

  // If user role is not allowed on this route, redirect to their role-specific home
  const userRole = (effectiveUser.role || "").toLowerCase() as UserRole;
  const normalizedAllowed = (allowedRoles || []).map(
    (r) => r.toLowerCase() as UserRole
  );

  const hasRole =
    normalizedAllowed.length === 0 ||
    normalizedAllowed.includes(userRole) ||
    (userRole === "superadmin" && normalizedAllowed.includes("admin"));

  if (!hasRole) {
    if (userRole === "superadmin" || userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "doctor") {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
