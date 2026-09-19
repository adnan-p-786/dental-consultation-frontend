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
      {/* Upper Newsletter / Triage Help strip */}
      {/* <div className="border-b border-white/10 bg-teal-deep/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/15 text-mint text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct Emergency & Online Triage
            </div>
            <h3 className="font-display text-2xl sm:text-3xl text-white font-medium">
              Need urgent dental advice or want a second opinion?
            </h3>
            <p className="text-sm text-[#A8C4B8] mt-1 max-w-xl">
              Connect with an on-duty dentist within 15 minutes through our secure video portal or walk into our clinic today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Link
              to="/auth/register"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-mint text-[#0C2420] font-semibold text-sm hover:bg-[#5EC29F] transition-colors shadow-sm active:scale-98"
            >
              Start Online Video Consult
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+918085478598"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4 text-mint" />
              +91 8085478598
            </a>
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-mint flex items-center justify-center text-[#0C2420] shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#0C2420]">
                    <path
                      d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-display font-semibold text-xl text-white block leading-tight">
                    Cedarview Dental
                  </span>
                  <span className="text-[11px] font-semibold text-mint tracking-wider uppercase">
                    Clinic & Telehealth Centre
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#A8C4B8] leading-relaxed max-w-sm mb-6">
                Redefining modern dentistry with high-precision digital diagnosis, gentle clinical treatments, and round-the-clock telehealth consultations.
              </p>

              <div className="flex items-center gap-4 text-xs text-[#90B5A7]">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-mint" />
                  <span>ADA Accredited</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-mint" />
                  <span>HIPAA Secure</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-mint" />
                  <span>Pain-Free Protocol</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wide uppercase mb-4 text-mint">
              Specialized Care
            </h4>
            <ul className="space-y-2.5 text-sm text-[#B4CDC1]">
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
            <h4 className="font-semibold text-white text-sm tracking-wide uppercase mb-4 text-mint">
              Patient Portal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#B4CDC1]">
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
            <h4 className="font-semibold text-white text-sm tracking-wide uppercase mb-4 text-mint">
              Clinic & Telehealth
            </h4>
            <div className="space-y-3 text-xs text-[#B4CDC1]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                <span>402 Cedarview Healthway, Suite 300, Medical District</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-mint shrink-0" />
                <span>+91 8085478598</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-mint shrink-0" />
                <span>care@cedarviewdental.com</span>
              </div>
              <div className="pt-2 border-t border-white/10 mt-3">
                <div className="flex items-center gap-2 text-white font-medium mb-1">
                  <Clock className="w-3.5 h-3.5 text-mint" />
                  <span>Opening Hours:</span>
                </div>
                <p>Mon – Sat: 8:00 AM – 7:00 PM</p>
                <p className="text-mint font-medium mt-0.5">Online Triage: 24/7 Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 h-px text-xs text-[#80A495]">
          <p>© {new Date().getFullYear()} Cedarview Dental Clinic Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
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
