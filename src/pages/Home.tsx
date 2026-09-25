import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import {
  Video,
  Clock,
  ShieldCheck,
  ArrowRight,
  Send,
  Search,
  Stethoscope,
  FileText,
  Paperclip,
  CheckCircle2,
  Calendar,
  UserCheck,
  Activity,
  HeartPulse,
  Sparkle,
  Sparkles,
  Smile,
  PlayCircle,
} from "lucide-react";

/**
 * Common online consultation categories
 */
const consultationCategories = [
  {
    code: "General Dental Consultation",
    title: "General Dental Consultation",
    icon: Stethoscope,
    desc: "First-time evaluation, second opinions, or general oral health questions.",
  },
  {
    code: "Root Canal Treatment",
    title: "Toothache & Nerve Pain",
    icon: Activity,
    desc: "Severe ache, hot/cold sensitivity, swelling, or urgent pulp diagnosis.",
  },
  {
    code: "Orthodontics",
    title: "Clear Aligners & Orthodontics",
    icon: Sparkle,
    desc: "Invisalign candidacy, bite alignment, crooked teeth, and gap correction.",
  },
  {
    code: "Cosmetic Dentistry",
    title: "Cosmetic Smile Design",
    icon: Smile,
    desc: "Teeth whitening, composite bonding, veneers, and smile aesthetics.",
  },
  {
    code: "Dental Implant",
    title: "Dental Implants & Missing Teeth",
    icon: HeartPulse,
    desc: "Single or full arch tooth replacement, bone density questions, and bridges.",
  },
  {
    code: "Tooth Extraction",
    title: "Wisdom Tooth & Extractions",
    icon: FileText,
    desc: "Impacted third molars, pain relief, and surgical extraction advice.",
  },
];

/**
 * 4-Step Online Consultation Workflow
 */
const consultationSteps = [
  {
    number: "01",
    icon: Send,
    title: "Sign In & Request Slot",
    body: "Sign in or register to select your dental concern, symptoms, and preferred time window for specialist review.",
  },
  {
    number: "02",
    icon: Search,
    title: "Doctor Review & Slot Confirmation",
    body: "A licensed dentist reviews your request, assigns your slot, and generates a private Google Meet or Zoom video link.",
  },
  {
    number: "03",
    icon: Video,
    title: "1-on-1 Video Consultation",
    body: "Click 'Join Call' at your scheduled time on your phone or laptop. Discuss symptoms directly with your specialist.",
  },
  {
    number: "04",
    icon: FileText,
    title: "Written Diagnosis & Notes",
    body: "Receive clinical diagnosis, recommended treatment plans, and printable consultation notes saved in your portal.",
  },
];

/**
 * Online Consultation Module Capabilities
 */
const portalHighlights = [
  {
    icon: PlayCircle,
    title: "Instant Video Meeting Room",
    body: "Direct 1-click meeting access via Google Meet or Zoom. No complex app downloads required.",
  },
  {
    icon: FileText,
    title: "Digital Clinical Summary",
    body: "Dentists record findings, diagnosis, and prescription notes directly to your personal consultation history.",
  },
  {
    icon: Paperclip,
    title: "Upload Photos & Dental Scans",
    body: "Attach high-resolution photos of your smile or dental X-rays so the dentist can review before the call.",
  },
  {
    icon: Clock,
    title: "Automated Meeting Reminders",
    body: "Receive email and SMS notifications 24h and 1h prior to your video call with joining instructions.",
  },
  {
    icon: UserCheck,
    title: "Specialist Workspace",
    body: "Dedicated portals for patients, attending doctors, and clinic admins to streamline every step.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted & Confidential",
    body: "All consultations and uploaded clinical records are protected with bank-grade encryption and access controls.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col font-sans text-ink selection:bg-[#5E3E3B]/20 selection:text-[#5E3E3B]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-teal-deep text-paper pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(201, 138, 130, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            <span>Online Dental Consultation Module</span>
          </div>

          <h1 className="font-display font-medium text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.14] max-w-4xl mx-auto mb-6">
            Consult a dentist online from anywhere
          </h1>

          <p className="text-base sm:text-lg text-[#EBD8D5] max-w-2xl mx-auto leading-relaxed mb-10">
            Connect directly with licensed dentists via live video. Request your consultation in under 2 minutes, get instant slot confirmation, and join your secure video room with one click.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <Link
              to={isAuthenticated ? "/appointment" : "/auth/login?redirect=/appointment"}
              className="px-7 py-3.5 rounded-4xl bg-[#5E3E3B] border border-white/25 text-white text-sm font-semibold hover:bg-[#262525] transition-all flex items-center gap-2 shadow-sm"
            >
              <Video className="w-4 h-4 text-mint" />
              <span>Book Video Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/patient/portal"
                className="px-7 py-3.5 rounded-4xl border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-mint" />
                <span>Go to Patient Portal</span>
              </Link>
            ) : (
              <a
                href="#how-it-works"
                className="px-7 py-3.5 rounded-4xl border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-mint" />
                <span>How Consultation Works</span>
              </a>
            )}
          </div>

          {/* Micro trust pills */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-x-8 text-xs sm:text-sm text-[#EBD8D5]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
              Verified Patient Consultations
            </span>
            <span className="flex items-center gap-2">
              <Video className="w-4 h-4 text-mint shrink-0" />
              Google Meet & Zoom video rooms
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-mint shrink-0" />
              Digital diagnosis & treatment summary
            </span>
          </div>
        </div>
      </section>

      <main className="grow">
        {/* Fast Consultation Selector */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2F0] text-teal-deep text-xs font-semibold uppercase tracking-wider mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-mint-deep" />
              <span>Choose Your Concern</span>
            </div>
            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              What would you like to consult on?
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Select your consultation category below to pre-fill your request and get scheduled with the appropriate dental specialist.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultationCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.code}
                  to={`/appointment?treatment=${encodeURIComponent(cat.code)}`}
                  className="group bg-white p-6 rounded-2xl border border-line hover:border-mint-deep/60 transition-all hover:shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mb-4 group-hover:bg-[#5E3E3B] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-medium text-lg text-ink group-hover:text-teal-deep transition-colors mb-1.5">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-teal-deep group-hover:text-[#262525]">
                    <span>Start Consultation Request</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-mint-deep" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-white border-y border-line py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2F0] text-teal-deep text-xs font-semibold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-mint-deep" />
                <span>Simple 4-Step Process</span>
              </div>
              <h2 className="font-display text-3xl font-medium text-ink mb-3">
                How your online consultation works
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                From initial request to your live 1-on-1 video call, everything is organized smoothly and securely.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {consultationSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="bg-[#FAF7F6] p-6 rounded-2xl border border-line flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xl font-bold text-teal-deep/30">
                          {step.number}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-white border border-line flex items-center justify-center text-teal-deep shadow-2xs">
                          <Icon className="w-5 h-5 text-mint-deep" />
                        </div>
                      </div>
                      <h3 className="font-display font-medium text-base text-ink mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-ink-soft leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              Purpose-built telehealth features
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Designed as a seamless add-on module providing high-definition video consultations, doctor workspaces, and patient records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portalHighlights.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white p-6 rounded-2xl border border-line shadow-2xs space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center">
                    <Icon className="w-5 h-5 text-mint-deep" />
                  </div>
                  <h3 className="font-display font-medium text-base text-ink">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-ink-soft leading-relaxed">
                    {feat.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Portals Access Banner */}
        <section className="bg-teal-deep text-white py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-semibold text-mint uppercase tracking-wider block">
                Workspaces & Portals
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-medium">
                Are you a Doctor or Clinic Administrator?
              </h2>
              <p className="text-xs sm:text-sm text-[#EBD8D5] max-w-xl">
                Access your consultation management workspace to review assigned patients, conduct video calls, and record clinical diagnosis notes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/doctor/dashboard"
                className="px-5 py-3 rounded-xl bg-white text-teal-deep hover:bg-[#FAF7F6] text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                Doctor Workspace
              </Link>
              <Link
                to="/admin/dashboard"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <div className="bg-white rounded-3xl border border-line p-8 sm:p-12 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-mint-deep" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-3">
              Ready to request your online consultation?
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed max-w-lg mx-auto mb-8">
              Sign in or register to select your preferred consultation time and connect directly with a licensed dentist.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Link
                to={isAuthenticated ? "/appointment" : "/auth/login?redirect=/appointment"}
                className="px-7 py-3 rounded-4xl bg-[#5E3E3B] hover:bg-[#262525] text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Book Video Consultation Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {isAuthenticated && (
                <Link
                  to="/patient/portal"
                  className="px-6 py-3 rounded-4xl border border-line text-ink text-sm font-medium hover:bg-[#FAF7F6] transition-colors"
                >
                  Patient Portal
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}