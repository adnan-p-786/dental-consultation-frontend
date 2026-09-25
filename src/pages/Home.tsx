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
  Mail,
  RefreshCw,
} from "lucide-react";

const consultationCategories = [
  {
    code: "General Dental Consultation",
    title: "General Dental Consultation",
    icon: Stethoscope,
    desc: "General dental concerns, oral health questions, evaluations, and consultation requests.",
  },
  {
    code: "Dental Implant",
    title: "Dental Implants",
    icon: HeartPulse,
    desc: "Consultation for missing teeth, dental implants, and tooth replacement options.",
  },
  {
    code: "Orthodontics",
    title: "Orthodontics",
    icon: Sparkle,
    desc: "Consultation for tooth alignment, bite concerns, braces, and orthodontic treatment.",
  },
  {
    code: "Cosmetic Dentistry",
    title: "Cosmetic Dentistry",
    icon: Smile,
    desc: "Discuss cosmetic dental concerns and available options for improving your smile.",
  },
  {
    code: "Root Canal Treatment",
    title: "Root Canal Treatment",
    icon: Activity,
    desc: "Discuss tooth pain, sensitivity, and concerns that may require root canal treatment.",
  },
  {
    code: "Tooth Extraction",
    title: "Tooth Extraction",
    icon: FileText,
    desc: "Consultation for teeth that may require extraction or further dental evaluation.",
  },
  {
    code: "Pediatric Dentistry",
    title: "Pediatric Dentistry",
    icon: Smile,
    desc: "Dental consultation and appointment requests for children and pediatric dental needs.",
  },
  {
    code: "Gum Treatment",
    title: "Gum Treatment",
    icon: HeartPulse,
    desc: "Discuss gum-related concerns and treatment requirements with the dental team.",
  },
  {
    code: "Dental Crowns & Bridges",
    title: "Crowns & Bridges",
    icon: Stethoscope,
    desc: "Consultation for damaged, missing, or weakened teeth requiring restorative treatment.",
  },
];

const consultationSteps = [
  {
    number: "01",
    icon: Send,
    title: "Request an Appointment",
    body: "Enter your details, select your treatment or case requirement, and choose your preferred appointment date and time.",
  },
  {
    number: "02",
    icon: Search,
    title: "Request Reviewed",
    body: "The clinic team reviews your request, confirms the requested time, or proposes a different date or time when required.",
  },
  {
    number: "03",
    icon: Calendar,
    title: "Appointment Confirmed",
    body: "Once approved, your confirmed appointment details, assigned doctor, consultation information, and meeting details are provided.",
  },
  {
    number: "04",
    icon: Video,
    title: "Online Consultation",
    body: "Join your scheduled online consultation using the meeting link provided with your approved appointment.",
  },
];

const portalHighlights = [
  {
    icon: Calendar,
    title: "Appointment Management",
    body: "Request appointments, receive approval, reschedule when required, and keep track of appointment status.",
  },
  {
    icon: Video,
    title: "Online Consultation",
    body: "Approved appointments can include an online consultation through a supported video platform.",
  },
  {
    icon: Paperclip,
    title: "Supporting Documents",
    body: "Patients can optionally provide supporting documents or images when submitting an appointment request.",
  },
  {
    icon: Mail,
    title: "Email Notifications",
    body: "Receive appointment confirmations, changes, cancellations, reminders, and consultation information by email.",
  },
  {
    icon: FileText,
    title: "Consultation Notes",
    body: "Doctors can record consultation findings, diagnosis or assessment, recommendations, instructions, and follow-up requirements.",
  },
  {
    icon: UserCheck,
    title: "Role-Based Access",
    body: "Separate access is provided for patients, doctors, and administrators based on their role and permitted information.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  const appointmentLink = isAuthenticated
    ? "/appointment"
    : "/auth/login?redirect=/appointment";

  return (
    <div className="min-h-screen bg-[#FAF7F6] flex flex-col font-sans text-ink selection:bg-[#5E3E3B]/20 selection:text-[#5E3E3B]">
      <Header />
      <section className="relative overflow-hidden bg-teal-deep text-paper pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-white/10">
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

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            <span>Online Dental Appointment & Consultation</span>
          </div>

          <h1 className="font-display font-medium text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.14] max-w-4xl mx-auto mb-6">
            Convenient dental appointments, from request to consultation
          </h1>

          <p className="text-base sm:text-lg text-[#EBD8D5] max-w-2xl mx-auto leading-relaxed mb-10">
            Request a dental appointment online, choose your treatment or case
            requirement, select your preferred date and time, and receive your
            appointment details through the clinic's online system.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <Link
              to={appointmentLink}
              className="px-7 py-3.5 rounded-4xl bg-[#5E3E3B] border border-white/25 text-white text-sm font-semibold hover:bg-[#262525] transition-all flex items-center gap-2 shadow-sm"
            >
              <Calendar className="w-4 h-4 text-mint" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/patient/portal"
                className="px-7 py-3.5 rounded-4xl border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-mint" />
                <span>Patient Portal</span>
              </Link>
            ) : (
              <a
                href="#how-it-works"
                className="px-7 py-3.5 rounded-4xl border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-mint" />
                <span>How It Works</span>
              </a>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-x-8 text-xs sm:text-sm text-[#EBD8D5]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
              Online appointment requests
            </span>

            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-mint shrink-0" />
              Scheduling & appointment updates
            </span>

            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-mint shrink-0" />
              Email appointment notifications
            </span>
          </div>
        </div>
      </section>

      <main className="grow">
        {/* =========================================================
            TREATMENTS
        ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2F0] text-teal-deep text-xs font-semibold uppercase tracking-wider mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-mint-deep" />
              <span>Dental Services</span>
            </div>

            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              What would you like to consult about?
            </h2>

            <p className="text-sm text-ink-soft leading-relaxed">
              Select a treatment or dental case when requesting your
              appointment. You can provide additional information and supporting
              documents to help the clinic understand your request.
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
                    <span>Request Appointment</span>

                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-mint-deep" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-white border-y border-line py-16 md:py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2F0] text-teal-deep text-xs font-semibold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-mint-deep" />
                <span>Simple Appointment Process</span>
              </div>

              <h2 className="font-display text-3xl font-medium text-ink mb-3">
                How your appointment works
              </h2>

              <p className="text-sm text-ink-soft leading-relaxed">
                From your initial appointment request to the online
                consultation, each stage is organized through the platform.
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

        {/* =========================================================
            FEATURES
        ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2F0] text-teal-deep text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-mint-deep" />
              <span>Platform Features</span>
            </div>

            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              Everything you need for your dental appointment
            </h2>

            <p className="text-sm text-ink-soft leading-relaxed">
              The platform brings appointment requests, scheduling,
              consultations, notifications, and consultation records together in
              one system.
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

        {/* =========================================================
            CONSULTATION SECTION
        ========================================================= */}
        <section className="bg-white border-y border-line py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2F0] text-teal-deep text-xs font-semibold uppercase tracking-wider mb-4">
                  <Video className="w-3.5 h-3.5 text-mint-deep" />
                  <span>Online Consultation</span>
                </div>

                <h2 className="font-display text-3xl font-medium text-ink mb-4">
                  Connect with your doctor online
                </h2>

                <p className="text-sm text-ink-soft leading-relaxed mb-6">
                  After an appointment is approved, the system can provide
                  consultation details and an online meeting link. Patients and
                  doctors can then join the scheduled consultation.
                </p>

                <Link
                  to={appointmentLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-4xl bg-[#5E3E3B] hover:bg-[#262525] text-white text-sm font-semibold transition-colors"
                >
                  Request an Appointment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FAF7F6] rounded-2xl border border-line p-5">
                  <Video className="w-5 h-5 text-mint-deep mb-3" />
                  <h3 className="font-display font-medium text-base mb-2">
                    Supported Video Platforms
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    The system can integrate with a suitable third-party video
                    platform such as Google Meet, Zoom, or Microsoft Teams.
                  </p>
                </div>

                <div className="bg-[#FAF7F6] rounded-2xl border border-line p-5">
                  <FileText className="w-5 h-5 text-mint-deep mb-3" />
                  <h3 className="font-display font-medium text-base mb-2">
                    Consultation Records
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Consultation findings, recommendations, instructions, and
                    follow-up requirements can be recorded by the doctor.
                  </p>
                </div>

                <div className="bg-[#FAF7F6] rounded-2xl border border-line p-5">
                  <Mail className="w-5 h-5 text-mint-deep mb-3" />
                  <h3 className="font-display font-medium text-base mb-2">
                    Email Updates
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Appointment confirmations, changes, cancellations, and
                    consultation reminders can be sent through email.
                  </p>
                </div>

                <div className="bg-[#FAF7F6] rounded-2xl border border-line p-5">
                  <RefreshCw className="w-5 h-5 text-mint-deep mb-3" />
                  <h3 className="font-display font-medium text-base mb-2">
                    Rescheduling
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    Appointment dates and times can be changed when rescheduling
                    is required, while retaining appointment history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECURITY / ACCESS
        ========================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="bg-white rounded-3xl border border-line p-8 sm:p-12">
            <div className="max-w-2xl mx-auto text-center">
              <ShieldCheck className="w-8 h-8 text-mint-deep mx-auto mb-4" />

              <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-4">
                Secure access for every role
              </h2>

              <p className="text-sm text-ink-soft leading-relaxed mb-8">
                Patients, doctors, and administrators have role-based access to
                the information and functions relevant to them. The system is
                designed around secure authentication, controlled access,
                protected patient information, and appointment audit trails.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-xl bg-[#FAF7F6]">
                  <h3 className="font-semibold text-sm mb-1">Patient</h3>
                  <p className="text-xs text-ink-soft">
                    Manage your profile, appointments, consultation details,
                    meeting access, and permitted history.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F6]">
                  <h3 className="font-semibold text-sm mb-1">Doctor</h3>
                  <p className="text-xs text-ink-soft">
                    View assigned appointments, patient information,
                    consultations, and consultation notes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F6]">
                  <h3 className="font-semibold text-sm mb-1">Administrator</h3>
                  <p className="text-xs text-ink-soft">
                    Manage appointments, patients, doctors, scheduling,
                    notifications, reports, and settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================= */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <div className="bg-white rounded-3xl border border-line p-8 sm:p-12 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-mint-deep" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-3">
              Ready to request your dental appointment?
            </h2>

            <p className="text-sm text-ink-soft leading-relaxed max-w-lg mx-auto mb-8">
              Submit your appointment request, select your treatment
              requirement, and choose your preferred date and time. The clinic
              team will review your request and provide the appointment details.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3">
              <Link
                to={appointmentLink}
                className="px-7 py-3 rounded-4xl bg-[#5E3E3B] hover:bg-[#262525] text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Book an Appointment</span>
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
