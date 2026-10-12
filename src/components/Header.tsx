import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Calendar,
  Clock,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
  ChevronDown,
  Mail,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const {
    user,
    isAuthenticated,
    openSignOutModal,
    isAdmin,
    isSuperAdmin,
    isDoctor,
  } = useAuth();
  const isSuper = isSuperAdmin || user?.role === "superadmin";
  const isPatient = isAuthenticated && !isAdmin && !isDoctor;

  const patientInitials = useMemo(() => {
    if (!user) return "P";
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "P";
  }, [user]);

  const patientFullName = useMemo(() => {
    if (!user) return "Patient";
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name || user.email || "Patient";
  }, [user]);

  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "Book Consultation",
      href: isAuthenticated
        ? "/appointment"
        : "/auth/login?redirect=/appointment",
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    const cleanHref = href.split("?")[0];
    return (
      pathname === cleanHref ||
      (cleanHref !== "/" && pathname?.startsWith(cleanHref))
    );
  };
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top micro announcement & utility bar */}
      <div className="bg-teal-deep text-[#EBD8D5] text-[12px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-mint shrink-0" />
            <div className="truncate text-[12px]">
              32<span className="text-[11px]">Stories</span> | Online Dental
              Consultation
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-[11.5px] text-[#D9C7C4]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-mint" />
              <span>Mon–Sat: 8:00 AM – 7:00 PM</span>
            </div>
            <a
              href="tel:+918085478598"
              className="flex items-center gap-1.5 text-white hover:text-mint transition-colors font-medium"
            >
              <Phone className="w-3 h-3 text-mint" />
              <span>+91 8085478598</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-line/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-deep rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-deep flex items-center justify-center text-[#FAF7F6] shadow-xs group-hover:bg-mint-deep transition-colors duration-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-mint"
              >
                <path
                  d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="font-display font-medium text-[22px] leading-tight text-teal-deep tracking-tight group-hover:text-mint-deep transition-colors">
                32<span className="text-[19px]">Stories</span>
              </div>
              <span className="text-[10.5px] font-semibold text-mint-deep tracking-wider uppercase leading-none mt-0.5">
                Online Consultation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3.5 py-2 rounded-xl text-[14px] transition-all duration-150 ${
                    active
                      ? "bg-[#FAF2F0] text-teal-deep font-semibold shadow-xs"
                      : "text-ink-soft hover:text-teal-deep hover:bg-line-soft/60 font-medium"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 rounded-xl bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.98] transition-all text-paper text-[13.5px] font-semibold py-2 px-3.5 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-mint" />
                    <span>
                      {isSuper ? "Super Admin Dashboard" : "Admin Dashboard"}
                    </span>
                  </Link>
                )}
                {isDoctor && (
                  <Link
                    to="/doctor/dashboard"
                    className="flex items-center gap-1.5 rounded-xl bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.98] transition-all text-paper text-[13.5px] font-semibold py-2 px-3.5 shadow-xs"
                  >
                    <Stethoscope className="w-4 h-4 text-mint" />
                    <span>Doctor Dashboard</span>
                  </Link>
                )}
                {isPatient && (
                  <>
                    

                    {/* Patient Own Profile Dropdown with Logout button inside */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF2F0] hover:bg-[#F3E7E4] border border-line transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-deep/20 group"
                          aria-label="Open patient profile menu"
                        >
                          <Avatar className="w-7 h-7 border border-teal-deep/20 shrink-0">
                            <AvatarFallback className="bg-teal-deep text-white text-[11px] font-bold">
                              {patientInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-left max-w-[120px] lg:max-w-[150px]">
                            <span className="text-xs font-semibold text-teal-deep leading-tight truncate">
                              {patientFullName}
                            </span>
                            <span className="text-[10px] text-ink-soft leading-none truncate">
                              Patient
                            </span>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-ink-soft group-hover:text-teal-deep transition-transform duration-200" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-72 rounded-xl border border-line bg-white shadow-xl p-1.5 z-50 animate-in fade-in-80"
                      >
                        {/* Profile Header Card */}
                        <div className="p-3 bg-paper rounded-lg border border-line/60 mb-1">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-teal-deep/20 shrink-0">
                              <AvatarFallback className="bg-teal-deep text-white text-sm font-bold">
                                {patientInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-ink truncate">
                                  {patientFullName}
                                </span>
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge className="bg-[#FAF2F0] text-teal-deep border-teal-deep/20 text-[9px] font-semibold px-1.5 py-0 leading-tight">
                                  Patient
                                </Badge>
                                {user?.id && (
                                  <span className="text-[10px] text-ink-soft font-mono">
                                    #PT-{user.id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-line/60 space-y-1 text-[11px] text-ink-soft">
                            {user?.email && (
                              <div className="flex items-center gap-2 truncate">
                                <Mail className="w-3 h-3 text-ink-soft shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            )}
                            {user?.phoneNumber && (
                              <div className="flex items-center gap-2 truncate">
                                <Phone className="w-3 h-3 text-ink-soft shrink-0" />
                                <span className="truncate">{user.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Navigation items */}
                        <DropdownMenuItem asChild>
                          <Link
                            to="/patient/portal"
                            className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-ink hover:text-[#5E3E3B] hover:bg-[#FAF2F0] rounded-lg cursor-pointer"
                          >
                            <Calendar className="w-4 h-4 text-[#5E3E3B]" />
                            <span>My Appointments</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Logout button inside profile */}
                        <DropdownMenuItem
                          onClick={() => openSignOutModal()}
                          className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                {!isPatient && (
                  <button
                    onClick={() => openSignOutModal()}
                    className="flex items-center gap-1 text-[13px] font-medium text-ink-soft hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    title="Log out"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth/register"
                  className="flex items-center gap-1.5 rounded-xl bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.98] transition-all duration-150 text-paper text-[13.5px] font-semibold py-2.5 px-4 shadow-xs"
                >
                  Sign Up
                </Link>

                {/* <Link
                  to={isAuthenticated ? "/appointment" : "/auth/login?redirect=/appointment"}
                  className="flex items-center gap-1.5 rounded-xl bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.98] transition-all duration-150 text-paper text-[13.5px] font-semibold py-2.5 px-4 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-mint" />
                  <span>Book Consultation</span>
                </Link> */}
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              isPatient ? (
                <Link
                  to="/patient/portal"
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#5E3E3B] hover:bg-[#262525] text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-mint" />
                  <span>Appointments</span>
                </Link>
              ) : (
                <button
                  onClick={() => openSignOutModal()}
                  className="p-1.5 rounded-lg text-ink-soft hover:text-red-600 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )
            ) : (
              <Link
                to={
                  isAuthenticated
                    ? "/appointment"
                    : "/auth/login?redirect=/appointment"
                }
                className="text-[13px] font-semibold bg-[#5E3E3B] hover:bg-[#262525] text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Book
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-ink hover:bg-line-soft transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-line px-5 py-5 shadow-xl animate-rise">
          <nav
            className="flex flex-col gap-1 mb-5"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14.5px] transition-colors ${
                    active
                      ? "bg-[#FAF2F0] text-teal-deep font-semibold"
                      : "text-ink-soft hover:text-ink hover:bg-line-soft/60 font-medium"
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-mint-deep" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-line/70 flex flex-col gap-2.5">
            <div className="text-[12px] text-ink-soft flex items-center justify-between py-1">
              <span>Clinic Helpline:</span>
              <a
                href="tel:+18005550199"
                className="text-teal-deep font-semibold hover:text-mint-deep"
              >
                +1 (800) 555-0199
              </a>
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 mt-1">
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-deep text-white text-[14px] font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 text-mint" />
                    <span>
                      {isSuper ? "Super Admin Dashboard" : "Admin Dashboard"}
                    </span>
                  </Link>
                )}
                {isDoctor && (
                  <Link
                    to="/doctor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-deep text-white text-[14px] font-semibold"
                  >
                    <Stethoscope className="w-4 h-4 text-mint" />
                    <span>Doctor Dashboard</span>
                  </Link>
                )}
                {isPatient && (
                  <div className="space-y-2">
                    <div className="p-3 bg-paper rounded-xl border border-line flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-teal-deep/20 shrink-0">
                        <AvatarFallback className="bg-teal-deep text-white text-xs font-bold">
                          {patientInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink truncate">
                          {patientFullName}
                        </div>
                        <div className="text-[10px] text-ink-soft truncate">
                          {user?.email || "Patient Portal"}
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/patient/portal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-deep text-white text-[14px] font-semibold shadow-xs"
                    >
                      <Calendar className="w-4 h-4 text-mint" />
                      <span>My Appointments</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openSignOutModal();
                      }}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[13px] font-semibold cursor-pointer w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
                {!isPatient && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openSignOutModal();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[14px] font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out ({user?.firstName})</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Link
                  to="/auth/login?redirect=/appointment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-line text-[14px] font-medium text-ink hover:bg-line-soft/50 text-center transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/register?redirect=/appointment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#5E3E3B] text-white text-[14px] font-semibold text-center hover:bg-[#262525] transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-mint" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
