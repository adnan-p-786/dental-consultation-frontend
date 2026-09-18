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
  CalendarCheck,
  ClipboardCheck,
  Stethoscope,
  FileText,
  Lock,
  History,
} from "lucide-react";

/**
 * Treatment codes mirror the Services page and the Scope of Work §2. Kept as
 * a small static preview here — the full, admin-configurable list lives on
 * the Services page.
 */
const treatmentPreview: { code: string; name: string; blurb: string }[] = [
  {
    code: "general_consultation",
    name: "General Consultation",
    blurb: "Not sure what's wrong, or want a second opinion",
  },
  {
    code: "root_canal",
    name: "Root Canal Treatment",
    blurb: "Persistent toothache or nerve pain",
  },
  {
    code: "gum_treatment",
    name: "Gum Treatment",
    blurb: "Bleeding, swollen, or receding gums",
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
    code: "dental_implant",
    name: "Dental Implant",
    blurb: "Replacing one or more missing teeth",
  },
  {
    code: "tooth_extraction",
    name: "Tooth Extraction",
    blurb: "A tooth that can't be saved, including wisdom teeth",
  },
  {
    code: "crowns_bridges",
    name: "Crowns & Bridges",
    blurb: "Rebuilding a damaged or missing tooth",
  },
  {
    code: "pediatric_dentistry",
    name: "Pediatric Dentistry",
    blurb: "Check-ups and prevention for children",
  },
];

const workflowSteps = [
  {
    icon: ClipboardCheck,
    title: "Send a request",
    body: "Tell us your details, pick a treatment, and give a preferred date and time. You'll get a reference number straight away.",
  },
  {
    icon: CalendarCheck,
    title: "Clinic reviews it",
    body: "Staff check the case, assign a dentist, and confirm your slot or propose a different time.",
  },
  {
    icon: Mail,
    title: "You get a confirmation",
    body: "An email with the date, time, dentist, and — for online consultations — the meeting link to join.",
  },
  {
    icon: Stethoscope,
    title: "Consultation happens",
    body: "You're seen by video or in the clinic. Findings and recommendations are saved to your record afterwards.",
  },
];

const trustPoints = [
  {
    icon: Lock,
    title: "Secure by design",
    body: "Encrypted connections, role-based access, and logged activity across the patient, doctor, and admin portals.",
  },
  {
    icon: FileText,
    title: "Written recommendations",
    body: "Your dentist explains the reasoning before treatment starts, and it's saved to your record — not just said out loud.",
  },
  {
    icon: History,
    title: "One consultation history",
    body: "Past appointments, notes, and follow-ups are all in one place, so nothing gets repeated or lost.",
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

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="font-display font-medium text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12] mb-6">
              See a dentist online, or book a visit — your choice
            </h1>
            <p className="text-base sm:text-lg text-[#D2E4DC] leading-relaxed mb-10">
              Send an appointment request in a couple of minutes. The clinic
              reviews it, confirms a time with you by email, and sends a
              meeting link if you've chosen an online consultation.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-xl bg-mint text-[#0C2420] text-sm font-semibold hover:bg-[#5EC29F] transition-colors flex items-center gap-2"
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 text-sm text-[#D2E4DC]">
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
                Reminders before every visit
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="grow">
        {/* How it works — mirrors the SOW status flow */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mb-12">
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

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="bg-white p-6 rounded-2xl border border-line"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-teal-deep text-white font-display font-bold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <Icon className="w-4 h-4 text-mint-deep" />
                  </div>
                  <h3 className="font-display font-medium text-base text-ink mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Treatment preview */}
        <section className="bg-white border-y border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl font-medium text-ink mb-3">
                  What can you book us for?
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Pick a treatment area below, or choose "something else" on
                  the request form if your case doesn't fit neatly into one
                  category.
                </p>
              </div>
              <Link
                to="/services"
                className="text-sm font-semibold text-teal-deep hover:text-mint-deep inline-flex items-center gap-1.5 shrink-0"
              >
                <span>See every treatment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatmentPreview.map((t) => (
                <Link
                  key={t.code}
                  to={`/services?treatment=${t.code}`}
                  className="group p-5 rounded-2xl border border-line hover:border-mint-deep/60 transition-colors flex items-start justify-between gap-3"
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
          </div>
        </section>

        {/* Online vs in-clinic */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              Choose the format that suits you
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Both routes go through the same review and confirmation process
              — the only difference is where the consultation happens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-line">
              <div className="w-10 h-10 rounded-xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mb-5">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-display font-medium text-lg text-ink mb-2">
                Online video consultation
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                Talk to a dentist from home about symptoms, an existing
                treatment plan, or a second opinion. You'll get a meeting link
                by email once your slot is confirmed, along with a reminder
                beforehand.
              </p>
              <p className="text-xs text-ink-soft leading-relaxed">
                Some treatments — like fillings, cleaning, and surgical
                procedures — still need an in-clinic visit. Your dentist will
                tell you if that's the case.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-line">
              <div className="w-10 h-10 rounded-xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mb-5">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-medium text-lg text-ink mb-2">
                In-clinic appointment
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                Request a chairside visit directly for examinations, hands-on
                treatment, or anything that needs equipment we can't bring to
                a video call. You'll still get a confirmation email with the
                date, time, and assigned dentist.
              </p>
              <p className="text-xs text-ink-soft leading-relaxed">
                Requesting doesn't reserve the slot on its own — the clinic
                confirms availability before your appointment is final.
              </p>
            </div>
          </div>
        </section>

        {/* Trust / security */}
        <section className="bg-teal-deep text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-mint text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              How we handle your information
            </div>
            <h2 className="font-display text-3xl font-medium mb-12 max-w-2xl">
              Your records are protected and only seen by people involved in your care
            </h2>

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
          <div className="bg-white rounded-3xl border border-line p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-3">
                Ready to send a request?
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                It takes a couple of minutes, and you'll get a reference
                number as soon as you submit it. The clinic confirms your
                slot from there.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl bg-teal-deep hover:bg-mint-deep text-white text-sm font-semibold transition-colors flex items-center gap-2"
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