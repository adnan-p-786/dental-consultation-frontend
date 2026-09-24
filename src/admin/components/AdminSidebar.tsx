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
  const { user, logout, isSuperAdmin } = useAuth();
  const isSuper = isSuperAdmin || user?.role === "superadmin";
  const adminName = user
    ? `${user.firstName} ${user.lastName}`
    : isSuper
      ? "Super Admin"
      : "Admin";
  const adminInitials = user
    ? `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase() ||
      (isSuper ? "SA" : "AD")
    : isSuper
      ? "SA"
      : "AD";
  const adminRoleLabel = isSuper ? "Super Admin" : "Clinic Admin";

  const allNavItems = [
    {
      id: "overview" as AdminTab,
      label: "Dashboard Overview",
      shortLabel: "Overview",
      icon: LayoutDashboard,
      badge: null,
      superOnly: false,
    },
    {
      id: "appointments" as AdminTab,
      label: "Appointments & Scheduling",
      shortLabel: "Appointments",
      icon: CalendarCheck2,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      superOnly: false,
    },
    {
      id: "doctors" as AdminTab,
      label: "Doctors & Availability",
      shortLabel: "Doctors",
      icon: Stethoscope,
      badge: null,
      superOnly: false,
    },
    {
      id: "reports" as AdminTab,
      label: "Reports & Analytics",
      shortLabel: "Analytics",
      icon: BarChart3,
      badge: null,
      superOnly: true,
    },
    {
      id: "settings" as AdminTab,
      label: "Clinic Settings",
      shortLabel: "Settings",
      icon: Settings,
      badge: null,
      superOnly: true,
    },
  ];

  const navItems = allNavItems.filter((item) => !item.superOnly || isSuper);

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
          "fixed inset-y-0 left-0 h-full w-72 max-w-[85vw]",
          mobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Brand Header */}
        <div>
          <div
            className={cn(
              "border-b border-line transition-all duration-200",
              collapsed && !mobileOpen
                ? "flex flex-col items-center py-4 px-2 gap-2"
                : "flex items-center justify-between px-5 py-5",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 min-w-0",
                collapsed && !mobileOpen ? "justify-center" : "overflow-hidden",
              )}
            >
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
                      {isSuper ? "Super Admin" : "Admin"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className={cn(
                "hidden md:flex rounded-lg text-ink-soft hover:text-teal-deep hover:bg-line-soft transition-colors cursor-pointer",
                collapsed && !mobileOpen
                  ? "w-8 h-8 items-center justify-center p-0"
                  : "p-1.5",
              )}
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
          <nav
            className={cn(
              "space-y-1.5 transition-all duration-200",
              collapsed && !mobileOpen ? "p-2" : "p-3",
            )}
          >
            {(!collapsed || mobileOpen) && (
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft/70">
                Management Portal
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isItemCollapsed = collapsed && !mobileOpen;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-150 text-left cursor-pointer group relative",
                    isItemCollapsed
                      ? "w-11 h-11 mx-auto justify-center p-0"
                      : "w-full gap-3 px-3.5 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-teal-deep text-white shadow-xs font-semibold"
                      : "text-ink-soft hover:bg-line-soft hover:text-teal-deep",
                  )}
                  title={isItemCollapsed ? item.label : undefined}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-transform group-hover:scale-105 shrink-0",
                        isActive
                          ? "text-emerald-300"
                          : "text-ink-soft group-hover:text-teal-deep",
                      )}
                    />
                    {isItemCollapsed && item.badge !== null && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1 ring-2 ring-white shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {!isItemCollapsed && (
                    <>
                      <span className="truncate flex-1 font-medium">
                        {item.label}
                      </span>

                      {item.badge !== null && (
                        <Badge
                          variant={isActive ? "secondary" : "requested"}
                          className="ml-auto text-[11px] px-2 py-0.5 shrink-0 font-bold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}

                  {/* Desktop hover tooltip when collapsed */}
                  {isItemCollapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1 rounded-lg bg-teal-deep text-white text-xs font-medium whitespace-nowrap shadow-md z-50 animate-in fade-in-0 zoom-in-95">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Links */}
        <div
          className={cn(
            "border-t border-line space-y-2.5 transition-all duration-200",
            collapsed && !mobileOpen ? "p-2 flex flex-col items-center" : "p-3",
          )}
        >
          {/* External patient site link */}
          {!collapsed || mobileOpen ? (
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
          ) : (
            <Link
              to="/"
              target="_blank"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-ink-soft hover:text-teal-deep hover:bg-line-soft transition-colors relative group"
              title="Open Patient Booking Site"
            >
              <ExternalLink className="w-4 h-4 text-mint-deep" />
              <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1 rounded-lg bg-teal-deep text-white text-xs font-medium whitespace-nowrap shadow-md z-50">
                Patient Booking Site
              </span>
            </Link>
          )}

          {/* Current Admin User */}
          <div
            className={cn(
              "flex items-center rounded-xl bg-paper border border-line",
              collapsed && !mobileOpen
                ? "w-10 h-10 justify-center p-0"
                : "gap-3 p-2 w-full",
            )}
            title={
              collapsed && !mobileOpen
                ? `${adminName} (${adminRoleLabel})`
                : undefined
            }
          >
            <Avatar className="w-8 h-8 border border-teal-deep/20 shrink-0">
              <AvatarFallback className="bg-teal-deep text-white text-[11px] font-bold">
                {adminInitials}
              </AvatarFallback>
            </Avatar>

            {(!collapsed || mobileOpen) && (
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
              "flex items-center text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded-xl",
              collapsed && !mobileOpen
                ? "w-10 h-10 justify-center p-0"
                : "gap-2 w-full px-3 py-2",
            )}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
