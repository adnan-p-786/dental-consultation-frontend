import { Link } from "react-router-dom";
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
  return (
    <footer className="bg-[#0C2420] text-[#D4E4DC] border-t border-teal-mid/30">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-mint flex items-center justify-center text-[#0C2420] shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-[#0C2420]">
                    <path
                      d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-display font-semibold text-lg sm:text-xl text-white block leading-tight">
                    Cedarview Dental
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-mint tracking-wider uppercase">
                    Clinic & Telehealth Centre
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#A8C4B8] leading-relaxed max-w-sm mb-4">
                Redefining modern dentistry with high-precision digital diagnosis, gentle clinical treatments, and round-the-clock telehealth consultations.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#90B5A7]">
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
            <h4 className="font-semibold text-mint text-xs sm:text-sm tracking-wider uppercase mb-3">
              Specialized Care
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#B4CDC1]">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Online Video Triage
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Cosmetic Smile Design
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Invisalign & Clear Aligners
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Dental Implants & Crowns
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Pediatric Family Care
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Urgent Same-Day Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h4 className="font-semibold text-mint text-xs sm:text-sm tracking-wider uppercase mb-3">
              Patient Portal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#B4CDC1]">
              <li>
                <Link to="/auth/login" className="hover:text-white transition-colors">
                  Patient Sign In
                </Link>
              </li>
              <li>
                <Link to="/auth/register" className="hover:text-white transition-colors">
                  Create Care Account
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Treatment Pricing Guide
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Accepted Insurance Plans
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Patient Privacy Notice
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Hours & Contact */}
          <div>
            <h4 className="font-semibold text-mint text-xs sm:text-sm tracking-wider uppercase mb-3">
              Clinic & Telehealth
            </h4>
            <div className="space-y-2 text-xs text-[#B4CDC1]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
                <span>402 Cedarview Healthway, Suite 300</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-mint shrink-0" />
                <span>+91 8085478598</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-mint shrink-0" />
                <span>care@cedarviewdental.com</span>
              </div>
              <div className="pt-2 border-t border-white/10 mt-2">
                <div className="flex items-center gap-1.5 text-white font-medium mb-0.5">
                  <Clock className="w-3 h-3 text-mint" />
                  <span>Hours:</span>
                </div>
                <p>Mon – Sat: 8:00 AM – 7:00 PM</p>
                <p className="text-mint font-medium mt-0.5">Online Triage: 24/7 Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#80A495]">
          <p>© {new Date().getFullYear()} Cedarview Dental Clinic Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
            <span className="hover:text-white cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
