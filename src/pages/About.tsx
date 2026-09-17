import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  CalendarCheck,
  Clock,
  ShieldCheck,
  Video,
  Stethoscope,
  FileText,
  Bell,
  Users,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Online Appointment Booking",
    description:
      "Patients can submit appointment requests by providing their details, treatment requirements, preferred date, and preferred time.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description:
      "Administrators can review requests, confirm appointment times, propose alternative schedules, and manage rescheduling.",
  },
  {
    icon: Video,
    title: "Online Consultation",
    description:
      "Approved appointments can include a secure meeting link through a supported third-party video consultation platform.",
  },
  {
    icon: FileText,
    title: "Consultation Records",
    description:
      "Doctors can record consultation findings, diagnosis or assessment, recommendations, instructions, and follow-up requirements.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Book Appointment",
    description:
      "The patient visits the website, selects the treatment or case requirement, enters their details, and submits an appointment request.",
  },
  {
    number: "02",
    title: "Appointment Review",
    description:
      "The administrator reviews the request, checks scheduling information, assigns a doctor, and confirms or proposes another time.",
  },
  {
    number: "03",
    title: "Appointment Approval",
    description:
      "Once approved, the confirmed date, time, doctor, consultation type, meeting details, and appointment reference are saved.",
  },
  {
    number: "04",
    title: "Online Consultation",
    description:
      "The patient receives the consultation details and joins the online meeting with the assigned doctor.",
  },
  {
    number: "05",
    title: "Consultation Notes",
    description:
      "The doctor records consultation findings, recommendations, instructions, and required follow-up information.",
  },
];

const roles = [
  {
    icon: ShieldCheck,
    title: "Super Admin",
    description:
      "Manages appointments, patients, doctors, users, settings, reports, and integrations.",
  },
  {
    icon: ClipboardList,
    title: "Appointment / Admin Staff",
    description:
      "Manages appointment requests, patient information, scheduling, and notifications.",
  },
  {
    icon: Stethoscope,
    title: "Doctor",
    description:
      "Views assigned appointments and patient information, conducts consultations, and manages consultation notes.",
  },
  {
    icon: Users,
    title: "Patient",
    description:
      "Manages their profile, appointments, consultation details, meeting access, and permitted consultation history.",
  },
];

const securityFeatures = [
  "Secure authentication and session management",
  "Role-based access control",
  "HTTPS and secure API communication",
  "Controlled access to patient information",
  "Appointment audit trail and access logging",
  "Secure handling of uploaded documents and images",
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] text-ink flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-teal-deep text-[#EFF6F2] pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-teal-mid/30">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-5">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Online Dental Appointment & Consultation</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.18] mb-6">
            Simple Dental Appointments,
            <br className="hidden sm:inline" />
            <span className="text-mint">
              {" "}
              Convenient Online Consultations.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#C7DDD4] leading-relaxed max-w-3xl mx-auto mb-8">
            A web-based platform that connects patients, administrators, and
            doctors through a streamlined appointment scheduling and online
            consultation workflow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-mint hover:bg-mint-deep text-teal-deep hover:text-white font-semibold text-xs sm:text-sm transition-all shadow-sm inline-flex items-center gap-1.5"
            >
              <span>Book an Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/services"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-all border border-white/15"
            >
              View Dental Services
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-20 w-full relative z-10 space-y-16">
        {/* Platform Overview */}
        <section className="bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(16,56,50,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-2">
                About the Platform
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep mb-5">
                A Complete Online Dental Appointment Workflow
              </h2>

              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                This platform is designed to simplify the process of requesting
                and managing dental appointments while supporting online
                consultations between patients and doctors.
              </p>

              <p className="text-sm text-ink-soft leading-relaxed">
                Patients can submit appointment requests, administrators can
                manage scheduling and approvals, and doctors can conduct online
                consultations and maintain consultation records.
              </p>
            </div>

            <div className="bg-paper/70 rounded-2xl p-6 border border-line">
              <h3 className="text-sm font-semibold text-teal-deep mb-4">
                Core Workflow
              </h3>

              <div className="space-y-3">
                {[
                  "Appointment Request",
                  "Scheduling & Review",
                  "Doctor Assignment",
                  "Appointment Approval",
                  "Online Consultation",
                  "Consultation Notes",
                  "Follow-up",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-ink-soft"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-deep text-mint flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>

                    <span>{item}</span>

                    {index < 6 && (
                      <div className="hidden sm:block ml-auto text-line">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-1">
              Platform Features
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
              Everything Needed for Online Dental Consultations
            </h2>

            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              The system brings appointment management, scheduling,
              consultation, notifications, and patient history together in one
              platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="bg-white p-5 rounded-2xl border border-line shadow-[0_2px_12px_rgba(16,56,50,0.02)] hover:border-mint/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-deep/5 text-teal-deep flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-mint-deep" />
                  </div>

                  <h3 className="font-semibold text-sm text-ink mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-ink-soft leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Patient Experience */}
        <section className="bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(16,56,50,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-2">
                Patient Portal
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep mb-4">
                Designed Around the Patient Journey
              </h2>

              <p className="text-sm text-ink-soft leading-relaxed mb-6">
                Patients can request appointments through the website and
                receive updates throughout the scheduling and consultation
                process.
              </p>

              <div className="space-y-3">
                {[
                  "Enter patient contact and appointment details",
                  "Select a treatment or case requirement",
                  "Choose a preferred appointment date and time",
                  "Submit an appointment request",
                  "Receive appointment confirmation and updates",
                  "Access the online consultation meeting",
                  "View permitted consultation history",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-ink-soft"
                  >
                    <CheckCircle2 className="w-4 h-4 text-mint-deep mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-paper/70 rounded-2xl p-6 border border-line">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-teal-deep text-mint flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Appointment Notifications
                  </h3>

                  <p className="text-xs text-ink-soft">
                    Automated communication throughout the appointment
                    lifecycle.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Appointment request received",
                  "Appointment approved",
                  "Appointment rescheduled",
                  "Appointment cancelled",
                  "Consultation reminder",
                  "Meeting and joining instructions",
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-xl border border-line px-4 py-3 text-xs text-ink-soft"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-line">
                <p className="text-xs text-ink-soft leading-relaxed">
                  Reminder timings can be configured, including reminders such
                  as 24 hours and 1 hour before a consultation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-1">
              How It Works
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
              From Appointment Request to Consultation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {workflow.map((item) => (
              <div
                key={item.number}
                className="bg-white rounded-2xl border border-line p-5 shadow-[0_2px_12px_rgba(16,56,50,0.02)]"
              >
                <div className="text-xs font-bold text-mint-deep mb-3">
                  {item.number}
                </div>

                <h3 className="font-semibold text-sm text-teal-deep mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-ink-soft leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Doctor Portal */}
        <section className="bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(16,56,50,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="bg-teal-deep rounded-2xl p-7 text-white">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                <Stethoscope className="w-6 h-6 text-mint" />
              </div>

              <h3 className="font-display text-2xl font-medium mb-3">
                Doctor Consultation Workspace
              </h3>

              <p className="text-sm text-[#C7DDD4] leading-relaxed">
                Doctors can access their assigned appointments, patient
                information, consultation links, and previous consultation
                history through their portal.
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-2">
                Doctor Portal
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep mb-5">
                Manage Consultations Efficiently
              </h2>

              <div className="space-y-3">
                {[
                  "View today's and upcoming appointments",
                  "Access assigned patient information",
                  "View previous consultation history",
                  "Access the online consultation link",
                  "Record consultation findings",
                  "Record diagnosis or assessment",
                  "Add treatment recommendations",
                  "Add instructions and follow-up requirements",
                  "Mark consultations as completed",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-ink-soft"
                  >
                    <CheckCircle2 className="w-4 h-4 text-mint-deep mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-1">
              Role-Based Access
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
              Different Portals for Different Responsibilities
            </h2>

            <p className="text-sm text-ink-soft mt-2">
              Access is organized according to the responsibilities of each
              system role.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  className="bg-white p-5 rounded-2xl border border-line shadow-[0_2px_12px_rgba(16,56,50,0.02)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-deep/5 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-mint-deep" />
                  </div>

                  <h3 className="font-semibold text-sm text-teal-deep mb-2">
                    {role.title}
                  </h3>

                  <p className="text-xs text-ink-soft leading-relaxed">
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(16,56,50,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-2">
                Security
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep mb-4">
                Secure Access to Patient Information
              </h2>

              <p className="text-sm text-ink-soft leading-relaxed">
                The platform includes security measures designed to protect
                access to appointments, consultations, patient information,
                uploaded documents, and other system data.
              </p>
            </div>

            <div className="space-y-3">
              {securityFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 bg-paper/70 border border-line rounded-xl p-3.5"
                >
                  <ShieldCheck className="w-4 h-4 text-mint-deep mt-0.5 shrink-0" />

                  <span className="text-xs text-ink-soft">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-teal-deep to-teal-mid rounded-3xl text-white p-8 sm:p-10 text-center shadow-lg">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-mint uppercase tracking-wider block mb-2">
              Online Dental Consultation
            </span>

            <h2 className="font-display text-2xl sm:text-3xl font-medium mb-3">
              Book Your Dental Appointment Online
            </h2>

            <p className="text-xs sm:text-sm text-[#C7DDD4] leading-relaxed mb-6">
              Submit your appointment request, provide your treatment
              requirements, and receive your appointment details through the
              platform.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl bg-white text-teal-deep hover:bg-paper font-semibold text-xs sm:text-sm transition-all shadow-sm inline-flex items-center gap-1.5"
              >
                <span>Request an Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/services"
                className="px-6 py-3 rounded-xl bg-mint hover:bg-mint-deep text-teal-deep hover:text-white font-semibold text-xs sm:text-sm transition-all"
              >
                View Treatment Categories
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}