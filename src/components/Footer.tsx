import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  HeartHandshake,
} from "lucide-react";

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="relative bg-[#5E3E3B] text-white border-t border-dotted border-white/20 overflow-hidden">
      {/* Dotted Theme Texture */}
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            maskImage:
              "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          }}
      />
      {/* Subtle depth lighting overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)",
        }}
      />

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-mint flex items-center justify-center text-[#241817] shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-4.5 h-4.5 text-[#241817]"
                  >
                    <path
                      d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-display font-semibold text-lg sm:text-xl text-white block leading-tight">
                    32<span className="text-[17px]">Stories</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-white tracking-wider uppercase">
                    Clinic & Telehealth Centre
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white leading-relaxed max-w-sm mb-4">
                Redefining modern dentistry with high-precision digital
                diagnosis, gentle clinical treatments, and round-the-clock
                telehealth consultations.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-white">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-mint" />
                  <span>ADA Accredited</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-mint" />
                  <span>HIPAA Secure</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-mint" />
                  <span>Pain-Free Protocol</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-xs sm:text-sm tracking-wider uppercase mb-3">
              Online Consultation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white">
              <li>
                <Link
                  to={isAuthenticated ? "/appointment" : "/auth/login?redirect=/appointment"}
                  className="hover:text-mint transition-colors"
                >
                  Book Video Consultation
                </Link>
              </li>
              <li>
                <Link
                  to={isAuthenticated ? "/appointment" : "/auth/login?redirect=/appointment"}
                  className="hover:text-mint transition-colors"
                >
                  Urgent Same-Day Slot
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/patient/portal"
                      className="hover:text-mint transition-colors"
                    >
                      Patient Portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/patient/portal"
                      className="hover:text-mint transition-colors"
                    >
                      Live Meeting Rooms
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/patient/portal"
                      className="hover:text-mint transition-colors"
                    >
                      Digital Prescriptions & Notes
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/appointment"
                      className="hover:text-mint transition-colors"
                    >
                      Virtual Dental Triage
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/appointment"
                      className="hover:text-mint transition-colors"
                    >
                      Consultation Pricing Guide
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Portals & Access */}
          <div>
            <h4 className="font-semibold text-white text-xs sm:text-sm tracking-wider uppercase mb-3">
              Portals & Access
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white">
              {isAuthenticated ? (
                <li>
                  <Link
                    to="/patient/portal"
                    className="hover:text-mint transition-colors"
                  >
                    Patient Consultation Portal
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to="/auth/login"
                      className="hover:text-mint transition-colors"
                    >
                      Sign In to Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/auth/register"
                      className="hover:text-mint transition-colors"
                    >
                      Register Patient Account
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/doctor/dashboard"
                  className="hover:text-mint transition-colors"
                >
                  Doctor Consultation Workspace
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/dashboard"
                  className="hover:text-mint transition-colors"
                >
                  Clinic Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Hours & Contact */}
          <div>
            <h4 className="font-semibold text-white text-xs sm:text-sm tracking-wider uppercase mb-3">
              Clinic & Telehealth
            </h4>
            <div className="space-y-2 text-xs text-white">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
                <span>402 32 stories Healthway, Suite 300</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-mint shrink-0" />
                <a
                  href="tel:+918085478598"
                  className="hover:text-mint transition-colors"
                >
                  +91 8085478598
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-mint shrink-0" />
                <a
                  href="mailto:care@32storiesdental.com"
                  className="hover:text-mint transition-colors"
                >
                  care@32 storiesdental.com
                </a>
              </div>
              <div className="pt-2 border-t border-dotted border-white/20 mt-2">
                <div className="flex items-center gap-1.5 text-white font-medium mb-0.5">
                  <Clock className="w-3 h-3 text-mint" />
                  <span>Hours:</span>
                </div>
                <p>Mon – Sat: 8:00 AM – 7:00 PM</p>
                <p className="text-white font-medium mt-0.5">
                  Online Triage: 24/7 Available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-dotted border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white">
          <p>
            © {new Date().getFullYear()} 32 stories Dental Clinic Ltd. All
            rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-mint transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-mint transition-colors">
              Terms of Use
            </Link>
            <span className="hover:text-mint cursor-pointer transition-colors">
              Accessibility
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
