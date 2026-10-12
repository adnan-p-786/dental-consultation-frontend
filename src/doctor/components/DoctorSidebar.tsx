import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Video,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";

export type DoctorTab =
  | "overview"
  | "appointments"
  | "patients"
  | "consultations"
  | "notes"
  | "treatments";

interface DoctorSidebarProps {
  activeTab: DoctorTab;
  onTabChange: (tab: DoctorTab) => void;
  assignedCount: number;
  todayCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  activeTab,
  onTabChange,
  assignedCount,
  todayCount,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { user, openSignOutModal } = useAuth();

  const doctorName = user
    ? `Dr. ${user.firstName} ${user.lastName}`
    : "Dr. Sarah Jenkins";
  const doctorInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      "DR"
    : "SJ";
  const roleLabel = "Attending Dental Specialist";

  const navItems = [
    {
      id: "overview" as DoctorTab,
      label: "Dashboard Overview",
      shortLabel: "Overview",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "appointments" as DoctorTab,
      label: "Assigned Appointments",
      shortLabel: "Appointments",
      icon: CalendarCheck2,
      badge: todayCount > 0 ? todayCount : assignedCount > 0 ? assignedCount : null,
      badgeVariant: todayCount > 0 ? "urgent" : "normal",
    },
    {
      id: "patients" as DoctorTab,
      label: "Patients Directory",
      shortLabel: "Patients",
      icon: Users,
      badge: null,
    },
    {
      id: "consultations" as DoctorTab,
      label: "Live Consultations",
      shortLabel: "Telehealth",
      icon: Video,
      badge: null,
    },
    {
      id: "notes" as DoctorTab,
      label: "Consultation Notes",
      shortLabel: "Clinical Notes",
      icon: FileText,
      badge: null,
    },
    {
      id: "treatments" as DoctorTab,
      label: "Treatment Updates",
      shortLabel: "Treatments",
      icon: Activity,
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
                    32Stories
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-[#FAF2F0] text-teal-deep border-teal-deep/20 text-[10px] font-bold px-1.5 py-0 leading-tight">
                      Doctor Portal
                    </Badge>
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
                Clinical Workspace
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
                    "w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left group relative",
                    collapsed && !mobileOpen
                      ? "justify-center p-3"
                      : "gap-3 px-3.5 py-3",
                    isActive
                      ? "bg-teal-deep text-white shadow-xs"
                      : "text-ink-soft hover:text-teal-deep hover:bg-line-soft/80",
                  )}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-mint"
                        : "text-ink-soft group-hover:text-teal-deep",
                    )}
                  />

                  {(!collapsed || mobileOpen) && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {/* Notification badge */}
                  {item.badge !== null && (
                    <span
                      className={cn(
                        "rounded-full font-bold text-[10px] flex items-center justify-center shrink-0",
                        collapsed && !mobileOpen
                          ? "absolute top-1.5 right-1.5 w-4 h-4"
                          : "px-2 py-0.5",
                        isActive
                          ? "bg-white text-teal-deep"
                          : item.badgeVariant === "urgent"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-[#FAF2F0] text-teal-deep",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip in collapsed desktop mode */}
                  {collapsed && !mobileOpen && (
                    <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1 rounded-lg bg-teal-deep text-white text-xs font-medium whitespace-nowrap shadow-md z-50">
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
          {/* Current Doctor User Card */}
          <div
            className={cn(
              "flex items-center rounded-xl bg-paper border border-line",
              collapsed && !mobileOpen
                ? "w-10 h-10 justify-center p-0"
                : "gap-3 p-2 w-full",
            )}
            title={
              collapsed && !mobileOpen
                ? `${doctorName} (${roleLabel})`
                : undefined
            }
          >
            <Avatar className="w-8 h-8 border border-teal-deep/20 shrink-0">
              <AvatarFallback className="bg-teal-deep text-white text-[11px] font-bold">
                {doctorInitials}
              </AvatarFallback>
            </Avatar>

            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col truncate flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-ink truncate">
                    {doctorName}
                  </span>
                  <Stethoscope className="w-3.5 h-3.5 text-mint-deep shrink-0" />
                </div>
                <span className="text-[11px] text-ink-soft truncate">
                  {roleLabel}
                </span>
              </div>
            )}
          </div>

          {/* Sign out button */}
          <button
            type="button"
            onClick={() => {
              openSignOutModal(() => {
                if (onCloseMobile) onCloseMobile();
                navigate("/auth/admin/login", { replace: true });
              });
            }}
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
export default DoctorSidebar;
