import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Calendar,
  Clock,
  Menu,
  Phone,
  Sparkles,
  X,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top micro announcement & utility bar */}
      <div className="bg-teal-deep text-[#DCEAE4] text-[12px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-teal-mid/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-mint flex-shrink-0" />
            <span className="truncate">
              Accepting new patients for online video & in-clinic consultations
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-[11.5px] text-[#A8C4B8]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-mint" />
              <span>Mon–Sat: 8:00 AM – 7:00 PM</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-mint/50" />
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

      {/* Main navigation bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-line/80 shadow-[0_2px_12px_rgba(16,56,50,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="Cedarview Dental Home"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-deep flex items-center justify-center text-paper shadow-xs group-hover:bg-mint-deep transition-all duration-200 group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-[#EFF6F2]"
              >
                <path
                  d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-[19px] leading-tight text-teal-deep tracking-tight group-hover:text-mint-deep transition-colors">
                Cedarview
              </span>
              <span className="text-[10.5px] font-semibold text-mint-deep tracking-wider uppercase leading-none mt-0.5">
                Dental Clinic
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
                      ? "bg-[#EDF6F2] text-teal-deep font-semibold shadow-xs"
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
            <Link
              to="/auth/login"
              className="text-[14px] font-medium text-ink hover:text-teal-deep px-3.5 py-2 rounded-xl hover:bg-line-soft/60 transition-colors"
            >
              Log in
            </Link>

            <Link
              to="/auth/register"
              className="flex items-center gap-1.5 rounded-xl bg-teal-deep hover:bg-mint-deep active:scale-[0.98] transition-all duration-150 text-paper text-[13.5px] font-semibold py-2.5 px-4 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-mint" />
              <span>Register</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/auth/register"
              className="text-[13px] font-semibold bg-teal-deep text-white px-3 py-1.5 rounded-lg"
            >
              Register
            </Link>
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
                      ? "bg-[#EDF6F2] text-teal-deep font-semibold"
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

            <div className="grid grid-cols-2 gap-2 mt-1">
              <Link
                to="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-line text-[14px] font-medium text-ink hover:bg-line-soft/50 text-center transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-deep text-white text-[14px] font-semibold text-center hover:bg-mint-deep transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-mint" />
                <span>Register</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
