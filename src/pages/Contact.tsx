import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Car,
  Accessibility,
  Activity,
  Loader2,
  ExternalLink,
  MessageSquare,
  Check,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

export default function Contact() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Question",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-populate logged-in user details
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: prev.email || user.email || "",
        phone: prev.phone || user.phoneNumber || "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post("/api/contact/create-contact", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phone.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });

      if (response.data?.success) {
        setSubmitted(true);
        toast.success(
          response.data.toast ||
            "Thank you! Your message has been sent to our care desk."
        );
      } else {
        toast.error(
          response.data?.message || "Failed to send message. Please try again."
        );
      }
    } catch (err: any) {
      console.error("Contact form submission error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send message. Please try again or call us directly.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      subject: "General Question",
      message: "",
    });
    setSubmitted(false);
  };

  const contactChannels = [
    {
      icon: Phone,
      title: "Clinic Helpline & Emergency",
      primary: "+91 8085478598",
      secondary: "Toll-Free: +1 (800) 555-0199",
      actionText: "Call Helpline",
      actionHref: "tel:+918085478598",
      highlight: true,
    },
    {
      icon: Mail,
      title: "Email Support & Inquiries",
      primary: "care@cedarviewdental.com",
      secondary: "appointments@cedarviewdental.com",
      actionText: "Send an Email",
      actionHref: "mailto:care@cedarviewdental.com",
      highlight: false,
    },
    {
      icon: MapPin,
      title: "Clinic Location",
      primary: "402 Cedarview Healthway",
      secondary: "Suite 300, Medical District",
      actionText: "Get Directions",
      actionHref: "https://maps.google.com/?q=402+Cedarview+Healthway",
      highlight: false,
      isExternal: true,
    },
    {
      icon: Clock,
      title: "Operating Hours",
      primary: "Mon – Sat: 8:00 AM – 7:00 PM",
      secondary: "Online Video Triage: 24/7 Available",
      actionText: "View Schedule",
      actionHref: "#hours",
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: "How fast will I receive a reply to my contact inquiry?",
      a: "Our reception and triage staff respond to all digital inquiries within 2 to 4 hours during operational clinic hours (Mon–Sat, 8:00 AM – 7:00 PM).",
    },
    {
      q: "How do I book an online video consultation or in-clinic visit?",
      a: "You can book directly via our Appointment portal. Simply select your major treatment category, choose your preferred slot, and our team will confirm your session.",
    },
    {
      q: "What if I have an urgent dental emergency after hours?",
      a: "For immediate dental trauma, uncontrolled bleeding, or severe pain, please call our emergency hotline directly at +91 8085478598 for round-the-clock telephone triage.",
    },
    {
      q: "Can I reschedule or cancel my requested appointment?",
      a: "Yes! Registered patients can manage, track, or cancel consultations directly from their personalized Patient Portal under 'My Appointments'.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-ink flex flex-col selection:bg-mint/30 selection:text-teal-deep">
      <Header />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-teal-deep text-[#EFF6F2] pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-teal-mid/30">
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

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            <span>We're Here For Your Smile • Responsive Care</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.15] mb-5">
            Get in Touch With{" "}
            <br className="hidden sm:inline" />
            <span className="text-mint">Cedarview Dental Clinic</span>
          </h1>

          <p className="text-base sm:text-lg text-[#C7DDD4] leading-relaxed max-w-2xl mx-auto">
            Have questions about dental treatments, insurance coverage, or our online video consultations? We are always happy to help you and your family.
          </p>
        </div>
      </section>

      {/* Four Quick Contact Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactChannels.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 border flex flex-col justify-between shadow-2xs ${
                  item.highlight
                    ? "bg-white border-mint-deep/40 ring-2 ring-mint-deep/10"
                    : "bg-white border-line hover:border-mint-deep/40 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-mint-deep" />
                  </div>

                  <h3 className="font-display font-semibold text-base text-ink mb-1">
                    {item.title}
                  </h3>

                  <p className="text-sm font-semibold text-teal-deep tracking-tight">
                    {item.primary}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {item.secondary}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-line/60">
                  <a
                    href={item.actionHref}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-deep hover:text-teal-deep transition-colors"
                  >
                    <span>{item.actionText}</span>
                    {item.isExternal ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Two-Column Content: Form & Clinic Guide */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-2xs">
            <div className="border-b border-line/70 pb-5 mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mint-deep mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Us a Message</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
                How Can We Help You Today?
              </h2>
              <p className="text-xs sm:text-sm text-ink-soft mt-1.5 leading-relaxed">
                Fill out the form below with your inquiry or feedback. Our administrative team typically replies within 2–4 hours.
              </p>
            </div>

            {submitted ? (
              <div className="py-10 text-center animate-in fade-in-50 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-medium text-teal-deep">
                  Message Successfully Sent!
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <strong>{formData.name}</strong>. A copy of your inquiry has been forwarded to our patient care desk at{" "}
                  <strong>{formData.email}</strong>.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-deep hover:bg-mint-deep text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span>Send Another Inquiry</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                  >
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
                    />
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                  >
                    Inquiry Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink font-medium outline-none transition-colors focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15 cursor-pointer"
                  >
                    <option value="General Question">General Dental Question</option>
                    <option value="Online Video Consultation">Online Video Consultation Assistance</option>
                    <option value="Treatment Estimates & Pricing">Treatment Estimates & Pricing</option>
                    <option value="Insurance & Payment Options">Insurance & Payment Options</option>
                    <option value="Existing Appointment Query">Existing Appointment Inquiry</option>
                    <option value="Feedback & Suggestions">Feedback & Clinic Experience</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                  >
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="How can our clinical or administrative team help you?"
                    className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15 resize-y"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl bg-teal-deep hover:bg-mint-deep text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : "active:scale-[0.99]"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-mint" />
                        <span>Sending Your Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-mint" />
                        <span>Submit Message</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[11.5px] text-ink-soft mt-2.5">
                    Your personal contact details are kept strictly confidential under HIPAA standards.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Appointment Callout & Clinic Amenities (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Booking Card */}
            <div className="bg-teal-deep text-[#EFF6F2] rounded-3xl p-7 relative overflow-hidden shadow-sm border border-teal-mid/30">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1.5px)",
                  backgroundSize: "18px 18px",
                }}
              />

              <div className="relative z-10 space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-mint text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-mint" />
                  <span>Looking to Book a Visit?</span>
                </div>

                <h3 className="font-display text-2xl font-medium text-white leading-tight">
                  Schedule Your Dental Consultation
                </h3>

                <p className="text-xs sm:text-sm text-[#C7DDD4] leading-relaxed">
                  Avoid waiting in line. Choose your treatment requirement, select your preferred date, and get scheduled with our specialist dentists.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    to="/appointment"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-mint hover:bg-[#52B895] text-[#0C2420] text-xs sm:text-sm font-semibold transition-all shadow-xs"
                  >
                    <span>Book an Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/patient/portal"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm font-semibold transition-all"
                  >
                    <span>My Portal</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Clinic Amenities & Comforts */}
            <div className="bg-white rounded-3xl border border-line p-6 sm:p-7 shadow-2xs space-y-4">
              <h3 className="font-display text-lg font-semibold text-teal-deep flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mint-deep" />
                <span>Visiting Cedarview Clinic</span>
              </h3>

              <ul className="space-y-3 text-xs text-ink-soft">
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#EDF6F2] text-mint-deep flex items-center justify-center shrink-0 mt-0.5">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-ink block text-xs">
                      Free Dedicated Patient Parking
                    </span>
                    <span>Reserved on-site parking stalls directly in front of the clinic entrance.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#EDF6F2] text-mint-deep flex items-center justify-center shrink-0 mt-0.5">
                    <Accessibility className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-ink block text-xs">
                      Wheelchair & Stretcher Accessible
                    </span>
                    <span>Ground floor zero-step ramp access and wide clinic treatment suites.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#EDF6F2] text-mint-deep flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-ink block text-xs">
                      Low-Radiation Digital 3D CBCT & X-Ray
                    </span>
                    <span>Immediate high-resolution diagnostics without external laboratory visits.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Operating Schedule Card */}
            <div id="hours" className="bg-[#FAFDFC] rounded-3xl border border-line p-6 sm:p-7 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-teal-deep font-semibold text-sm">
                <Clock className="w-4 h-4 text-mint-deep" />
                <span>Clinical & Reception Schedule</span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-line/60 pt-1">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-ink-soft font-medium">Monday – Friday:</span>
                  <span className="font-semibold text-ink">8:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-ink-soft font-medium">Saturday:</span>
                  <span className="font-semibold text-ink">9:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-ink-soft font-medium">Sunday:</span>
                  <span className="font-semibold text-amber-700">Emergency Triage Only</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-ink-soft font-medium">Online Video Triage:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    24/7 Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 border-t border-line/80 pt-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6F2] text-mint-deep text-xs font-semibold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Common Questions</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              Find quick answers regarding our appointments, video consultations, and clinic policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-line p-5 sm:p-6 shadow-2xs hover:border-mint-deep/40 transition-colors"
              >
                <h4 className="font-display font-semibold text-sm sm:text-base text-ink mb-2 flex items-start gap-2.5">
                  <span className="text-mint-deep font-mono text-xs font-bold shrink-0 mt-0.5">
                    Q{idx + 1}.
                  </span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}