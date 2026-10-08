import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { SignOutConfirmModal } from "@/components/SignOutConfirmModal";

export type UserRole = "patient" | "doctor" | "superadmin" | "admin";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isDoctor: boolean;
  isPatient: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  openSignOutModal: (callback?: () => void) => void;
  confirmSignOut: (callback?: () => void) => void;
  closeSignOutModal: () => void;
  isSignOutModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "dental_auth_token";
const USER_KEY = "dental_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [signOutCallback, setSignOutCallback] = useState<(() => void) | null>(
    null
  );

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUserStr = localStorage.getItem(USER_KEY);

      if (savedToken && savedUserStr) {
        const parsedUser: AuthUser = JSON.parse(savedUserStr);
        // Normalize role to lowercase
        parsedUser.role = (parsedUser.role?.toLowerCase() ||
          "patient") as UserRole;
        setToken(savedToken);
        setUser(parsedUser);
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    const normalizedUser = {
      ...newUser,
      role: (newUser.role?.toLowerCase() || "patient") as UserRole,
    };
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    setToken(newToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully", {
      duration: 2500,
    });
  };

  const openSignOutModal = (callback?: () => void) => {
    setSignOutCallback(() => callback || null);
    setIsSignOutModalOpen(true);
  };

  const closeSignOutModal = () => {
    setIsSignOutModalOpen(false);
    setSignOutCallback(null);
  };

  const handleConfirmSignOut = () => {
    const cb = signOutCallback;
    closeSignOutModal();
    logout();
    if (cb) {
      cb();
    }
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(token && user);
  const isSuperAdmin = role === "superadmin";
  const isAdmin = role === "admin" || role === "superadmin";
  const isDoctor = role === "doctor";
  const isPatient = role === "patient";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        role,
        isAdmin,
        isSuperAdmin,
        isDoctor,
        isPatient,
        login,
        logout,
        openSignOutModal,
        confirmSignOut: openSignOutModal,
        closeSignOutModal,
        isSignOutModalOpen,
      }}
    >
      {children}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={closeSignOutModal}
        onConfirm={handleConfirmSignOut}
        user={user}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
