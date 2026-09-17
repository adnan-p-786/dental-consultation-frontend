
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Calendar,
  Upload,
  Phone,
  Mail,
  Sparkles,
  User,
  CheckCircle2,
} from "lucide-react";

// Treatment / Case categories from the Scope of Work
export const documentTreatmentCategories = [
  "General Dental Consultation",
  "Dental Implant",
  "Orthodontics",
  "Cosmetic Dentistry",
  "Root Canal Treatment",
  "Tooth Extraction",
  "Pediatric Dentistry",
  "Gum Treatment",
  "Dental Crowns & Bridges",
  "Other",
] as const;

export type TreatmentCategory =
  (typeof documentTreatmentCategories)[number];

type ContactMethod = "Phone" | "Email" | "Other";

export default function Contact() {
  const [selectedTreatment, setSelectedTreatment] =
    useState<TreatmentCategory>("General Dental Consultation");

  const [contactMethod, setContactMethod] =
    useState<ContactMethod>("Email");

  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
    supportingFile: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      supportingFile: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // UI only for now.
    // Backend integration can create the appointment with
    // initial status: "Pending".

    setSubmitted(true);
  };

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

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-mint" />

            <span>
              Online Dental Appointment & Consultation
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.15] mb-5">
            Book an Appointment &{" "}
            <br className="hidden sm:inline" />

            <span className="text-mint">
              Request an Online Consultation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#C7DDD4] leading-relaxed max-w-2xl mx-auto">
            Submit your details and case requirements to request
            an appointment. Your request will be reviewed and
            scheduled by the clinic.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 w-full relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(16,56,50,0.05)]">

            {submitted ? (
              /* Confirmation */
              <div className="py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-mint/15 text-mint-deep flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep mb-3">
                  Appointment Request Submitted
                </h2>

                <p className="text-sm text-ink-soft leading-relaxed max-w-md mx-auto mb-6">
                  Your appointment request has been submitted
                  successfully and is now pending review.
                </p>

                <div className="bg-paper/70 border border-line rounded-2xl p-5 max-w-md mx-auto mb-6">
                  <p className="text-xs text-ink-soft mb-1">
                    Initial Appointment Status
                  </p>

                  <p className="text-base font-semibold text-teal-deep">
                    Pending
                  </p>
                </div>

                <p className="text-xs text-ink-soft">
                  An acknowledgement email may be sent with your
                  appointment request details.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                id="appointment-form"
              >
                {/* Form Header */}
                <div className="border-b border-line/70 pb-4 mb-2">
                  <h2 className="font-display text-2xl font-medium text-teal-deep">
                    Appointment Booking Form
                  </h2>

                  <p className="text-xs text-ink-soft mt-1">
                    Fields marked with an asterisk (
                    <span className="text-rose-500">*</span>) are
                    required.
                  </p>
                </div>

                {/* 1. Treatment / Case */}
                <div>
                  <label
                    htmlFor="treatment-select"
                    className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2"
                  >
                    Major Treatment / Case Requirement{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  <select
                    id="treatment-select"
                    required
                    value={selectedTreatment}
                    onChange={(e) =>
                      setSelectedTreatment(
                        e.target.value as TreatmentCategory
                      )
                    }
                    className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/40 text-ink font-medium outline-none transition-colors focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15 cursor-pointer"
                  >
                    {documentTreatmentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Quick Selection */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {documentTreatmentCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedTreatment(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          selectedTreatment === cat
                            ? "bg-teal-deep text-white border-teal-deep font-semibold shadow-2xs"
                            : "bg-paper text-ink-soft border-line hover:border-mint/50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Patient Details */}
                <div className="space-y-4 pt-1">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="patientName"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Patient Full Name{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        id="patientName"
                        value={formData.patientName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
                      />

                      <User className="w-4 h-4 text-ink-soft/60 absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                      >
                        Email Address{" "}
                        <span className="text-rose-500">*</span>
                      </label>

                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
                        />

                        <Mail className="w-4 h-4 text-ink-soft/60 absolute right-3.5 top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                      >
                        Phone Number{" "}
                        <span className="text-rose-500">*</span>
                      </label>

                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+91 98765 43210"
                          className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
                        />

                        <Phone className="w-4 h-4 text-ink-soft/60 absolute right-3.5 top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Preferred Contact Method{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {(
                        ["Phone", "Email", "Other"] as const
                      ).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() =>
                            setContactMethod(method)
                          }
                          className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                            contactMethod === method
                              ? "bg-teal-deep text-white border-teal-deep shadow-2xs font-semibold"
                              : "bg-paper text-ink border-line hover:border-mint/50"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Preferred Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label
                      htmlFor="preferredDate"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Preferred Appointment Date{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      type="date"
                      id="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      required
                      className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="preferredTime"
                      className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                    >
                      Preferred Appointment Time{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <select
                      id="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      required
                      className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15 cursor-pointer"
                    >
                      <option value="">
                        Select preferred time
                      </option>
                      <option value="Morning">
                        Morning
                      </option>
                      <option value="Afternoon">
                        Afternoon
                      </option>
                      <option value="Evening">
                        Evening
                      </option>
                    </select>
                  </div>
                </div>

                {/* 4. Additional Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                  >
                    Additional Description / Message
                  </label>

                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide any additional information about your dental case or appointment request..."
                    className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15 resize-y"
                  />
                </div>

                {/* 5. Supporting Documents / Images */}
                <div>
                  <label
                    htmlFor="supportingFile"
                    className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
                  >
                    Optional Supporting Documents / Images
                  </label>

                  <label
                    htmlFor="supportingFile"
                    className="border border-dashed border-line rounded-xl p-6 text-center bg-paper/40 hover:bg-white hover:border-mint-deep transition-all cursor-pointer group block"
                  >
                    <Upload className="w-5 h-5 text-mint-deep mx-auto mb-2 group-hover:-translate-y-0.5 transition-transform" />

                    <span className="text-xs font-medium text-ink block">
                      Click to attach a document or image
                    </span>

                    <span className="text-[11px] text-ink-soft block mt-1">
                      Supporting documents or images related to
                      your appointment request
                    </span>

                    {formData.supportingFile && (
                      <span className="text-xs text-mint-deep font-medium block mt-3">
                        Selected: {formData.supportingFile.name}
                      </span>
                    )}

                    <input
                      id="supportingFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-teal-deep hover:bg-mint-deep text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-mint" />

                    <span>Submit Appointment Request</span>
                  </button>

                  <p className="text-center text-[11.5px] text-ink-soft mt-3">
                    Your request will initially be marked as{" "}
                    <strong>Pending</strong> and made available
                    for review.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
