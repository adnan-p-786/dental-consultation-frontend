import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck2,
  Stethoscope,
  BarChart3,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";

export type AdminTab =
  | "overview"
  | "appointments"
  | "doctors"
  | "reports"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingRequestsCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingRequestsCount,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const adminName = user ? `${user.firstName} ${user.lastName}` : "Admin";
  const adminInitials = user
    ? `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase() ||
      "AD"
    : "SA";
  const adminRoleLabel = user?.role === "admin" ? "Administrator" : "Staff";

  const navItems = [
    {
      id: "overview" as AdminTab,
      label: "Dashboard Overview",
      shortLabel: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "appointments" as AdminTab,
      label: "Appointments & Scheduling",
      shortLabel: "Appointments",
      icon: CalendarCheck2,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
    {
      id: "doctors" as AdminTab,
      label: "Doctors & Availability",
      shortLabel: "Doctors",
      icon: Stethoscope,
      badge: null,
    },
    {
      id: "reports" as AdminTab,
      label: "Reports & Analytics",
      shortLabel: "Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "settings" as AdminTab,
      label: "Clinic Settings",
      shortLabel: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "flex flex-col justify-between border-r border-line bg-white select-none z-50 shrink-0 transition-all duration-300",
          // Desktop positioning
          "md:relative md:h-screen md:sticky md:top-0 md:translate-x-0",
          collapsed ? "md:w-20" : "md:w-72",
          // Mobile drawer positioning
          "fixed inset-y-0 left-0 h-full w-72",
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-5 py-5 border-b border-line">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-teal-deep text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path
                    d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col truncate">
                  <span className="font-semibold text-base text-ink tracking-tight">
                    Cedarview
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-ink-soft">Dental Portal</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded border border-teal-200">
                      Admin
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-ink-soft hover:text-teal-deep hover:bg-line-soft transition-colors cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-ink-soft hover:text-teal-deep hover:bg-line-soft transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation List */}
          <nav className="p-3 space-y-1.5">
            {(!collapsed || mobileOpen) && (
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft/70">
                Management Portal
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer group relative",
                    isActive
                      ? "bg-teal-deep text-white shadow-xs font-semibold"
                      : "text-ink-soft hover:bg-line-soft hover:text-teal-deep",
                  )}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform group-hover:scale-105",
                      isActive
                        ? "text-emerald-300"
                        : "text-ink-soft group-hover:text-teal-deep",
                    )}
                  />

                  {(!collapsed || mobileOpen) && (
                    <span className="truncate flex-1 font-medium">
                      {item.label}
                    </span>
                  )}

                  {item.badge !== null && (
                    <Badge
                      variant={isActive ? "secondary" : "requested"}
                      className={cn(
                        "ml-auto text-[11px] px-2 py-0.5 shrink-0 font-bold",
                        collapsed &&
                          !mobileOpen &&
                          "absolute top-1 right-1 px-1.5 py-0 text-[10px]",
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Links */}
        <div className="p-3 border-t border-line space-y-3">
          {!collapsed && (
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-ink-soft hover:text-teal-deep hover:bg-line-soft transition-colors group"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-mint-deep" />
                Patient Booking Site
              </span>
              <span className="text-[10px] text-ink-soft/60 group-hover:underline">
                Open tab
              </span>
            </Link>
          )}

          {/* Current Admin User */}
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl bg-paper border border-line",
              collapsed && "justify-center p-2",
            )}
          >
            <Avatar className="w-9 h-9 border border-teal-deep/20">
              <AvatarFallback className="bg-teal-deep text-white text-xs font-bold">
                {adminInitials}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex flex-col truncate flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-ink truncate">
                    {adminName}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-deep shrink-0" />
                </div>
                <span className="text-[11px] text-ink-soft truncate">
                  {adminRoleLabel}
                </span>
              </div>
            )}
          </div>

          {/* Sign out button */}
          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer",
              collapsed && "justify-center px-2",
            )}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
