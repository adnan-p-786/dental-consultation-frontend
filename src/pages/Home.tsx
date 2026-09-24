import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Video,
  Building2,
  Clock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Send,
  Search,
  CalendarClock,
  Stethoscope,
  FileText,
  Lock,
  History,
  Paperclip,
  RefreshCw,
  ListChecks,
  PlayCircle,
  Sparkles,
} from "lucide-react";

/**
 * Treatment codes and labels mirror Scope of Work §2 (Treatment / Case
 * Selection), in the same order. Kept as a small static preview here — the
 * full, admin-configurable list lives on the Services page (SOW §14).
 */
const treatmentPreview: { code: string; name: string; blurb: string }[] = [
  {
    code: "general_consultation",
    name: "General Dental Consultation",
    blurb: "Not sure what's wrong, or want a second opinion",
  },
  {
    code: "dental_implant",
    name: "Dental Implant",
    blurb: "Replacing one or more missing teeth",
  },
  {
    code: "orthodontics",
    name: "Orthodontics",
    blurb: "Crooked, crowded, or gapped teeth",
  },
  {
    code: "cosmetic_dentistry",
    name: "Cosmetic Dentistry",
    blurb: "Whitening, bonding, and veneers",
  },
  {
    code: "root_canal",
    name: "Root Canal Treatment",
    blurb: "Persistent toothache or nerve pain",
  },
  {
    code: "tooth_extraction",
    name: "Tooth Extraction",
    blurb: "A tooth that can't be saved, including wisdom teeth",
  },
  {
    code: "pediatric_dentistry",
    name: "Pediatric Dentistry",
    blurb: "Check-ups and prevention for children",
  },
  {
    code: "gum_treatment",
    name: "Gum Treatment",
    blurb: "Bleeding, swollen, or receding gums",
  },
  {
    code: "crowns_bridges",
    name: "Dental Crowns & Bridges",
    blurb: "Rebuilding a damaged or missing tooth",
  },
  {
    code: "other",
    name: "Other",
    blurb: "Your case doesn't fit a category — describe it in your own words",
  },
];

/**
 * Mirrors the SOW §3 status flow:
 * Requested → Under Review → Proposed → Approved → Completed
 */
const workflowSteps = [
  {
    icon: Send,
    status: "Requested",
    body: "Send your details, treatment, and preferred date and time. You get a reference number straight away, and your request starts as Pending.",
  },
  {
    icon: Search,
    status: "Under review",
    body: "Clinic staff review your case and assign a dentist based on availability.",
  },
  {
    icon: CalendarClock,
    status: "Proposed",
    body: "The clinic accepts your preferred slot, or suggests a different date and time.",
  },
  {
    icon: Mail,
    status: "Approved",
    body: "You receive an email with the date, time, dentist, consultation type, and — for online consultations — the meeting link.",
  },
  {
    icon: Stethoscope,
    status: "Completed",
    body: "After your consultation, findings, recommendations, and follow-up are saved to your record.",
  },
];

/** SOW §2 — Appointment Booking fields. */
const requestFields = [
  "Your name",
  "Email address",
  "Phone number",
  "Preferred contact method",
  "Treatment or case",
  "Preferred date",
  "Preferred time",
  "Additional message",
];

/** SOW §1, §5, §8 — what the patient portal gives you. */
const portalFeatures = [
  {
    icon: ListChecks,
    title: "Track your request",
    body: "See whether your appointment is pending, under review, proposed, approved, or completed.",
  },
  {
    icon: PlayCircle,
    title: "Join your consultation",
    body: "Once approved, a Join Consultation option appears in your account alongside your meeting link.",
  },
  {
    icon: History,
    title: "Review your history",
    body: "Past appointments, doctors, recommendations, and follow-ups, kept in date order.",
  },
];

/** SOW §13 — Security. */
const trustPoints = [
  {
    icon: Lock,
    title: "Secure by design",
    body: "Secure sign-in, encrypted connections, role-based access, and an audit trail across the patient, doctor, and admin portals.",
  },
  {
    icon: FileText,
    title: "Written recommendations",
    body: "Your dentist records their findings, assessment, recommended treatment, and follow-up in your record — not just out loud.",
  },
  {
    icon: History,
    title: "One consultation history",
    body: "Past appointments, notes, and follow-ups are in one place, and you can view the information your clinic has made available to you.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-ink selection:bg-mint/30 selection:text-teal-deep">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-teal-deep text-paper pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(79, 169, 138, 0.4) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>In-Clinic Visits & Online Video Consultations</span>
          </div>

          <h1 className="font-display font-medium text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.14] max-w-4xl mx-auto mb-6">
            See a dentist online, or book a visit — your choice
          </h1>
          <p className="text-base sm:text-lg text-[#D2E4DC] max-w-2xl mx-auto leading-relaxed mb-10">
            Send an appointment request in a couple of minutes. The clinic
            reviews it, confirms a time with you by email, and includes a
            meeting link if you've chosen an online consultation.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
            <Link
              to="/appointment"
              className="px-6 py-3.5 rounded-xl bg-mint text-[#0C2420] text-sm font-semibold hover:bg-[#5EC29F] transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>Request an appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/services"
              className="px-6 py-3.5 rounded-xl border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Browse treatments
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-x-8 text-sm text-[#D2E4DC]">
            <span className="flex items-center gap-2">
              <Video className="w-4 h-4 text-mint shrink-0" />
              Online video consultations
            </span>
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-mint shrink-0" />
              In-clinic appointments
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-mint shrink-0" />
              Email reminders before your consultation
            </span>
          </div>
        </div>
      </section>

      <main className="grow">
        {/* How it works — mirrors the SOW status flow (§3) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              How an appointment request works
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Every request moves through the same stages, whether you're
              booking a video consultation or an in-clinic visit. You can
              check where yours has reached at any time in your patient
              account.
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.status}
                  className="bg-white p-6 rounded-2xl border border-line"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-teal-deep text-white font-display font-bold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <Icon className="w-4 h-4 text-mint-deep" />
                  </div>
                  <h3 className="font-display font-medium text-base text-ink mb-2">
                    {step.status}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-white p-5 max-w-3xl mx-auto">
            <RefreshCw className="w-4 h-4 text-mint-deep shrink-0 mt-0.5" />
            <p className="text-sm text-ink-soft leading-relaxed">
              Plans change. If the clinic reschedules or cancels, you're
              notified by email automatically. A request can also be marked
              Reschedule Requested, Cancelled, or No Show, and earlier
              appointment details are kept as history.
            </p>
          </div>
        </section>

        {/* What to include in a request (SOW §2 Appointment Booking) */}
        <section className="bg-white border-y border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="font-display text-3xl font-medium text-ink mb-3">
                What to include in your request
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                The request form asks for the details below. The more you tell
                us about your case, the easier it is for the clinic to match
                you with the right dentist and time.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requestFields.map((field) => (
                  <li
                    key={field}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-line text-sm text-ink bg-[#F8FAF9]/50"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-mint-deep shrink-0" />
                    {field}
                  </li>
                ))}
                <li className="sm:col-span-2 flex items-start gap-3 px-4 py-3 rounded-xl border border-dashed border-mint-deep/60 text-sm text-ink bg-mint/5">
                  <Paperclip className="w-4 h-4 text-mint-deep shrink-0 mt-0.5" />
                  <span>
                    Photos or documents{" "}
                    <span className="text-ink-soft">
                      (optional) — attach anything that helps the dentist
                      understand your case.
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Treatment preview (SOW §2 Treatment / Case Selection) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              What can you book us for?
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Pick a treatment area below, or choose "Other" on the request
              form if your case doesn't fit neatly into one category.
            </p>
            <Link
              to="/services"
              className="text-sm font-semibold text-teal-deep hover:text-mint-deep inline-flex items-center gap-1.5"
            >
              <span>See every treatment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {treatmentPreview.map((t) => (
              <Link
                key={t.code}
                to={
                  t.code === "other"
                    ? "/contact"
                    : `/services?treatment=${t.code}`
                }
                className="group bg-white p-5 rounded-2xl border border-line hover:border-mint-deep/60 transition-colors flex items-start justify-between gap-3"
              >
                <div>
                  <span className="font-display font-medium text-base text-ink group-hover:text-teal-deep transition-colors block mb-1">
                    {t.name}
                  </span>
                  <span className="text-xs text-ink-soft leading-relaxed">
                    {t.blurb}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-line group-hover:text-mint-deep transition-colors shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Online vs in-clinic */}
        <section className="bg-white border-y border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="font-display text-3xl font-medium text-ink mb-3">
                Choose the format that suits you
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                Both routes go through the same review and confirmation
                process — the only difference is where the consultation
                happens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8FAF9] p-7 rounded-2xl border border-line">
                <div className="w-10 h-10 rounded-xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mb-5">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="font-display font-medium text-lg text-ink mb-2">
                  Online video consultation
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-4">
                  Talk to a dentist from home about symptoms, an existing
                  treatment plan, or a second opinion. Once your slot is
                  approved, you'll get a meeting link by email and a
                  Join Consultation option in your account, plus reminders
                  before the call.
                </p>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Calls run on a supported video platform such as Google Meet,
                  Zoom, or Microsoft Teams. If your case needs hands-on care,
                  your dentist will let you know and recommend an in-clinic
                  visit.
                </p>
              </div>

              <div className="bg-[#F8FAF9] p-7 rounded-2xl border border-line">
                <div className="w-10 h-10 rounded-xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mb-5">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-display font-medium text-lg text-ink mb-2">
                  In-clinic appointment
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed mb-4">
                  Request a chairside visit directly for examinations,
                  hands-on treatment, or anything that needs equipment we
                  can't bring to a video call. You'll still get a
                  confirmation email with the date, time, and assigned
                  dentist.
                </p>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Requesting doesn't reserve the slot on its own — the clinic
                  confirms availability before your appointment is final.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Patient account (SOW §1, §5, §8) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              Everything in your patient account
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              After you send a request, your account is where you follow it
              through to the consultation and look back on it afterwards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portalFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white p-6 rounded-2xl border border-line"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-medium text-base text-ink mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust / security (SOW §13) */}
        <section className="bg-teal-deep text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>How we handle your information</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-white leading-snug">
                Your records are protected and only seen by people involved in
                your care
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <Icon className="w-5 h-5 text-mint mb-4" />
                    <h3 className="font-display font-medium text-base text-white mb-2">
                      {point.title}
                    </h3>
                    <p className="text-sm text-[#D2E4DC] leading-relaxed">
                      {point.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="bg-white rounded-3xl border border-line p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xs">
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-3">
              Ready to send a request?
            </h2>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed max-w-xl mx-auto mb-8">
              It takes a couple of minutes, and you'll get a reference
              number as soon as you submit it. The clinic reviews your
              request and confirms your slot from there.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Link
                to="/appointment"
                className="px-6 py-3 rounded-xl bg-teal-deep hover:bg-mint-deep text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Request an appointment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+918085478598"
                className="px-6 py-3 rounded-xl border border-line text-ink text-sm font-medium hover:bg-[#F8FAF9] transition-colors"
              >
                Call reception
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}