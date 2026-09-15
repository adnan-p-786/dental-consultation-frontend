import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Phone,
  Mail,
  Clock,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Video,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Stethoscope,
  FileText,
  User,
  ExternalLink,
  Laptop,
  Smartphone,
  Wifi,
  FileCheck,
  Pill,
} from "lucide-react";

// Virtual Telehealth Operating Hours
interface VirtualHour {
  day: string;
  hours: string;
  isOpen: boolean;
  dayIndex: number;
}

const virtualHours: VirtualHour[] = [
  { day: "Monday", hours: "8:00 AM – 10:00 PM EST", isOpen: true, dayIndex: 1 },
  {
    day: "Tuesday",
    hours: "8:00 AM – 10:00 PM EST",
    isOpen: true,
    dayIndex: 2,
  },
  {
    day: "Wednesday",
    hours: "8:00 AM – 10:00 PM EST",
    isOpen: true,
    dayIndex: 3,
  },
  {
    day: "Thursday",
    hours: "8:00 AM – 10:00 PM EST",
    isOpen: true,
    dayIndex: 4,
  },
  { day: "Friday", hours: "8:00 AM – 10:00 PM EST", isOpen: true, dayIndex: 5 },
  {
    day: "Saturday",
    hours: "8:00 AM – 8:00 PM EST",
    isOpen: true,
    dayIndex: 6,
  },
  {
    day: "Sunday",
    hours: "9:00 AM – 6:00 PM EST (On-Duty Triage)",
    isOpen: true,
    dayIndex: 0,
  },
];

// Tele-Dental Virtual Departments
const virtualDepartments = [
  {
    name: "Urgent Video Triage & Prescriptions",
    lead: "Dr. Sarah Jenkins, DDS",
    phone: "+91 8085478598",
    email: "triage@cedarviewdental.com",
    focus:
      "Acute tooth pain, dental abscesses, antibiotic & pain management prescriptions",
    badge: "< 15 Min Queue",
  },
  {
    name: "Clear Aligners & Virtual Orthodontics",
    lead: "Dr. Marcus Vance, Orthodontist",
    phone: "+91 8085478599",
    email: "ortho@cedarviewdental.com",
    focus:
      "Invisalign® candidacies, 3D ClinCheck review, progress tracking via photos",
    badge: "Free Smile Simulation",
  },
  {
    name: "Cosmetic Dentistry & Second Opinions",
    lead: "Dr. Elena Rostova, Cosmetic Specialist",
    phone: "+91 8085478597",
    email: "cosmetics@cedarviewdental.com",
    focus:
      "Veneers suitability, smile makeover quotes, independent treatment plan audit",
    badge: "Scan Review",
  },
  {
    name: "Digital Records & Pharmacy Coordination",
    lead: "Telehealth Care Desk",
    phone: "+91 8085478590",
    email: "records@cedarviewdental.com",
    focus:
      "Electronic health records (EHR), pharmacy routing, receipt & insurance superbills",
    badge: "E-Prescription Desk",
  },
];

// Common Tele-Dental Concerns
const teleConcerns = [
  "Severe Toothache / Swelling",
  "Antibiotic / Pain Prescription",
  "Invisalign® & Aligner Evaluation",
  "Second Opinion on Dental Quote",
  "Chipped or Broken Tooth Advice",
  "Wisdom Tooth Symptoms",
  "Bleeding or Receding Gums",
  "Post-Op Procedure Check-in",
];

// Tele-Dentistry FAQs
const teleFaqs = [
  {
    question: "How does a 100% online dental video consultation work?",
    answer:
      "You join a secure, browser-based HD video consultation directly from your phone, tablet, or computer. No software download is required. During the session, you'll speak 1-on-1 with a licensed dentist who assesses your symptoms, reviews mouth photos or X-rays you uploaded, provides clinical advice, and issues immediate digital prescriptions if needed.",
  },
  {
    question:
      "Can an online dentist send an antibiotic or pain relief prescription?",
    answer:
      "Yes. When clinically indicated for dental infections, post-trauma inflammation, or severe pain, our licensed dental practitioners generate an e-prescription sent immediately to your local registered pharmacy of choice for fast pickup.",
  },
  {
    question: "How should I photograph my teeth before the call?",
    answer:
      "Use your smartphone camera in a well-lit room (or turn on the flashlight). Use your fingers or a clean spoon to gently retract your cheek or lips, and capture a clear, close-up photo of the problematic tooth or gum area. You can upload it directly into our consultation form.",
  },
  {
    question: "What if my condition requires in-person hands-on procedure?",
    answer:
      "If your virtual dentist determines that hands-on physical intervention (such as an emergency root canal, extraction, or cavity filling) is required, we provide clinical triage notes, pain management guidance, and refer you to an accredited physical dental facility near your zip code.",
  },
  {
    question: "Do I need special hardware or an app to join?",
    answer:
      "No app download is needed. Our video rooms operate seamlessly on Google Chrome, Apple Safari, Microsoft Edge, and modern mobile browsers with your standard device camera and microphone.",
  },
  {
    question: "Are virtual dental consultations covered by dental insurance?",
    answer:
      "Many dental insurance providers and HSA/FSA plans cover tele-dentistry (CDT codes D0140 / D9995). Following your appointment, we provide an itemized superbill receipt with doctor credentials that you can submit for direct reimbursement.",
  },
];

export default function Contact() {
  // Form State
  const [inquiryType, setInquiryType] = useState<
    "instant-video" | "scheduled-video" | "second-opinion" | "general"
  >("instant-video");
  const [patientType, setPatientType] = useState<"new" | "registered">("new");
  const [preferredPlatform, setPreferredPlatform] = useState<
    "browser" | "whatsapp" | "zoom"
  >("browser");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "asap",
    pharmacyZip: "",
    message: "",
  });
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [roomToken, setRoomToken] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic Live Status for Tele-Consultation Desk
  const teleStatus = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Everyday online coverage: 8:00 to 22:00
    if (dayOfWeek === 0) {
      if (hour >= 9 && hour < 18) {
        return {
          isOpen: true,
          label: "Dentists Online Now",
          detail: "Live video triage available • Estimated wait time: ~6 mins",
          color: "emerald",
        };
      }
      return {
        isOpen: false,
        label: "On-Call Emergency Queue",
        detail:
          "Standard virtual slots resume 8:00 AM • Emergency on-call team active",
        color: "amber",
      };
    } else {
      if (hour >= 8 && hour < 22) {
        return {
          isOpen: true,
          label: "Dentists Online Now",
          detail: "Live video triage active • Estimated wait time: ~4 mins",
          color: "emerald",
        };
      }
      return {
        isOpen: false,
        label: "Night Triage Desk",
        detail:
          "Virtual consultations open 8:00 AM • Urgent triage monitored overnight",
        color: "amber",
      };
    }
  }, []);

  const todayIndex = new Date().getDay();

  // Toggle concern pills
  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  // Copy helper
  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(identifier);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedToken = `TELE-ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
      setRoomToken(generatedToken);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1100);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSelectedConcerns([]);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      preferredDate: "",
      preferredTime: "asap",
      pharmacyZip: "",
      message: "",
    });
    setAttachedFile(null);
  };

  return (
    <></>
    // <div className="min-h-screen bg-[#F8FAF9] text-ink flex flex-col selection:bg-mint/30 selection:text-teal-deep">
    //   <Header />

    //   {/* Hero Header Section - 100% Fully Online Consultation */}
    //   <section className="relative overflow-hidden bg-teal-deep text-[#EFF6F2] pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-teal-mid/30">
    //     {/* Subtle decorative dot pattern */}
    //     <div
    //       className="absolute inset-0 opacity-80 pointer-events-none"
    //       style={{
    //         backgroundImage:
    //           "radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)",
    //         backgroundSize: "24px 24px",
    //         maskImage:
    //           "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
    //         WebkitMaskImage:
    //           "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
    //       }}
    //     />

    //     {/* Ambient background glows */}
    //     <div className="absolute -top-24 right-10 w-96 h-96 bg-mint/10 rounded-full blur-3xl pointer-events-none" />
    //     <div className="absolute -bottom-20 left-10 w-80 h-80 bg-teal-mid/20 rounded-full blur-3xl pointer-events-none" />

    //     <div className="relative max-w-7xl mx-auto">
    //       <div className="max-w-3xl">
    //         {/* Eyebrow badge */}
    //         <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-mint text-xs font-semibold uppercase tracking-wider mb-5">
    //           <span className="relative flex h-2 w-2">
    //             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
    //             <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
    //           </span>
    //           <span>100% Virtual Tele-Dentistry Platform</span>
    //         </div>

    //         <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-[1.15] mb-5">
    //           Consult a Licensed Dentist <br className="hidden sm:inline" />
    //           <span className="text-mint">Anytime, from Anywhere.</span>
    //         </h1>

    //         <p className="text-base sm:text-lg text-[#C7DDD4] leading-relaxed max-w-2xl mb-8">
    //           No waiting rooms, no traffic, and no delays. Connect with an
    //           accredited dental specialist over secure HD video for instant
    //           toothache triage, digital prescriptions, second opinions, and
    //           orthodontic reviews.
    //         </p>

    //         {/* Quick Guarantees Pill Bar */}
    //         <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#D5E8DF]">
    //           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
    //             <Video className="w-4 h-4 text-mint shrink-0" />
    //             <span>Encrypted HD Video Consultations</span>
    //           </div>
    //           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
    //             <Pill className="w-4 h-4 text-mint shrink-0" />
    //             <span>E-Prescriptions Sent to Your Pharmacy</span>
    //           </div>
    //           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
    //             <ShieldCheck className="w-4 h-4 text-mint shrink-0" />
    //             <span>HIPAA Compliant & ADA Certified</span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </section>

    //   {/* Main Content Area */}
    //   <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 w-full relative z-10">
    //     {/* 4 Virtual Channels Ribbon */}
    //     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
    //       {/* Card 1: Virtual Triage Hotline */}
    //       <div className="bg-white p-5 rounded-2xl border border-line shadow-[0_4px_20px_rgba(16,56,50,0.04)] hover:shadow-[0_8px_28px_rgba(16,56,50,0.08)] transition-all duration-200 group flex flex-col justify-between">
    //         <div>
    //           <div className="w-10 h-10 rounded-xl bg-teal-deep/5 text-teal-deep flex items-center justify-center mb-3 group-hover:bg-mint/20 group-hover:text-teal-deep transition-colors">
    //             <Phone className="w-5 h-5 text-mint-deep" />
    //           </div>
    //           <span className="text-[11px] font-bold text-mint-deep uppercase tracking-wider block">
    //             Tele-Triage Phone
    //           </span>
    //           <h3 className="font-semibold text-ink text-base mt-0.5">
    //             +91 8085478598
    //           </h3>
    //           <p className="text-xs text-ink-soft mt-1">
    //             Speak directly with our virtual nursing triage desk.
    //           </p>
    //         </div>
    //         <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
    //           <a
    //             href="tel:+918085478598"
    //             className="text-xs font-semibold text-teal-deep hover:text-mint-deep flex items-center gap-1"
    //             id="btn-call-tele-triage"
    //           >
    //             Call Hotline <ArrowRight className="w-3.5 h-3.5" />
    //           </a>
    //           <button
    //             type="button"
    //             onClick={() => handleCopy("+91 8085478598", "phone")}
    //             className="text-xs text-ink-soft hover:text-teal-deep p-1 rounded-md transition-colors"
    //             title="Copy phone number"
    //             id="btn-copy-tele-phone"
    //           >
    //             {copiedText === "phone" ? (
    //               <Check className="w-3.5 h-3.5 text-mint-deep" />
    //             ) : (
    //               <Copy className="w-3.5 h-3.5" />
    //             )}
    //           </button>
    //         </div>
    //       </div>

    //       {/* Card 2: WhatsApp Photo Review */}
    //       <div className="bg-white p-5 rounded-2xl border border-line shadow-[0_4px_20px_rgba(16,56,50,0.04)] hover:shadow-[0_8px_28px_rgba(16,56,50,0.08)] transition-all duration-200 group flex flex-col justify-between">
    //         <div>
    //           <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
    //             <MessageSquare className="w-5 h-5 text-emerald-600" />
    //           </div>
    //           <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
    //             Photo & Voice Triage
    //           </span>
    //           <h3 className="font-semibold text-ink text-base mt-0.5">
    //             WhatsApp Consult
    //           </h3>
    //           <p className="text-xs text-ink-soft mt-1">
    //             Send photos of teeth or pain videos for quick doctor review.
    //           </p>
    //         </div>
    //         <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
    //           <a
    //             href="https://wa.me/918085478598?text=Hi%20Cedarview%20Dental%2C%20I%20would%20like%20to%20start%20an%20online%20dental%20consultation"
    //             target="_blank"
    //             rel="noreferrer"
    //             className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
    //             id="btn-whatsapp-triage"
    //           >
    //             Chat on WhatsApp <ExternalLink className="w-3 h-3" />
    //           </a>
    //         </div>
    //       </div>

    //       {/* Card 3: 24/7 Urgent Online Prescription Desk */}
    //       <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 p-5 rounded-2xl border border-rose-200/80 shadow-[0_4px_20px_rgba(16,56,50,0.04)] hover:shadow-[0_8px_28px_rgba(225,29,72,0.08)] transition-all duration-200 group flex flex-col justify-between">
    //         <div>
    //           <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
    //             <AlertCircle className="w-5 h-5 text-rose-600" />
    //           </div>
    //           <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
    //             Acute Pain Desk
    //           </span>
    //           <h3 className="font-semibold text-ink text-base mt-0.5">
    //             24/7 E-Prescription
    //           </h3>
    //           <p className="text-xs text-rose-900/80 mt-1">
    //             Antibiotics, severe swelling & trauma guidance.
    //           </p>
    //         </div>
    //         <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between">
    //           <a
    //             href="tel:+918085478598"
    //             className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
    //             id="btn-urgent-eprescription"
    //           >
    //             Instant Video Call <ArrowRight className="w-3.5 h-3.5" />
    //           </a>
    //         </div>
    //       </div>

    //       {/* Card 4: Digital Records & Scan Uploads */}
    //       <div className="bg-white p-5 rounded-2xl border border-line shadow-[0_4px_20px_rgba(16,56,50,0.04)] hover:shadow-[0_8px_28px_rgba(16,56,50,0.08)] transition-all duration-200 group flex flex-col justify-between">
    //         <div>
    //           <div className="w-10 h-10 rounded-xl bg-teal-deep/5 text-teal-deep flex items-center justify-center mb-3 group-hover:bg-mint/20 group-hover:text-teal-deep transition-colors">
    //             <Mail className="w-5 h-5 text-mint-deep" />
    //           </div>
    //           <span className="text-[11px] font-bold text-mint-deep uppercase tracking-wider block">
    //             Records & Superbills
    //           </span>
    //           <h3 className="font-semibold text-ink text-base mt-0.5 truncate">
    //             care@cedarviewdental.com
    //           </h3>
    //           <p className="text-xs text-ink-soft mt-1">
    //             Submit past X-rays, 3D scans, or insurance claims.
    //           </p>
    //         </div>
    //         <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
    //           <a
    //             href="mailto:care@cedarviewdental.com"
    //             className="text-xs font-semibold text-teal-deep hover:text-mint-deep flex items-center gap-1"
    //             id="btn-email-records"
    //           >
    //             Send Records <ArrowRight className="w-3.5 h-3.5" />
    //           </a>
    //           <button
    //             type="button"
    //             onClick={() => handleCopy("care@cedarviewdental.com", "email")}
    //             className="text-xs text-ink-soft hover:text-teal-deep p-1 rounded-md transition-colors"
    //             title="Copy email address"
    //             id="btn-copy-tele-email"
    //           >
    //             {copiedText === "email" ? (
    //               <Check className="w-3.5 h-3.5 text-mint-deep" />
    //             ) : (
    //               <Copy className="w-3.5 h-3.5" />
    //             )}
    //           </button>
    //         </div>
    //       </div>
    //     </div>

    //     {/* How Online Consultations Work (3 Step Flow) */}
    //     <section className="mb-12 bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(16,56,50,0.05)]">
    //       <div className="max-w-3xl mb-8">
    //         <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-1">
    //           Seamless Virtual Process
    //         </span>
    //         <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
    //           How Your Online Dental Consultation Works
    //         </h2>
    //         <p className="text-sm text-ink-soft mt-1">
    //           Get clinical care from your couch in three simple, encrypted
    //           steps.
    //         </p>
    //       </div>

    //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //         <div className="p-5 rounded-2xl bg-paper/60 border border-line/80 relative">
    //           <div className="w-8 h-8 rounded-full bg-teal-deep text-white font-bold text-xs flex items-center justify-center mb-3 shadow-xs">
    //             1
    //           </div>
    //           <h3 className="font-semibold text-sm text-ink mb-1.5">
    //             Submit Symptoms & Photos
    //           </h3>
    //           <p className="text-xs text-ink-soft leading-relaxed">
    //             Fill out the quick online intake form below and optionally
    //             upload a smartphone photo or X-ray of your tooth.
    //           </p>
    //         </div>

    //         <div className="p-5 rounded-2xl bg-paper/60 border border-line/80 relative">
    //           <div className="w-8 h-8 rounded-full bg-teal-deep text-white font-bold text-xs flex items-center justify-center mb-3 shadow-xs">
    //             2
    //           </div>
    //           <h3 className="font-semibold text-sm text-ink mb-1.5">
    //             Join Encrypted HD Video
    //           </h3>
    //           <p className="text-xs text-ink-soft leading-relaxed">
    //             Connect directly with an accredited doctor via browser or
    //             WhatsApp video. No software installation needed.
    //           </p>
    //         </div>

    //         <div className="p-5 rounded-2xl bg-paper/60 border border-line/80 relative">
    //           <div className="w-8 h-8 rounded-full bg-teal-deep text-white font-bold text-xs flex items-center justify-center mb-3 shadow-xs">
    //             3
    //           </div>
    //           <h3 className="font-semibold text-sm text-ink mb-1.5">
    //             Prescription & Care Plan
    //           </h3>
    //           <p className="text-xs text-ink-soft leading-relaxed">
    //             Receive instant digital pharmacy prescriptions, treatment
    //             diagnoses, and clinical notes in your patient account.
    //           </p>
    //         </div>
    //       </div>
    //     </section>

    //     {/* Two Column Grid: Interactive Virtual Consultation Form & Live Online Status */}
    //     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    //       {/* Left Column: Interactive Online Consultation Form (7 cols) */}
    //       <div className="lg:col-span-7 bg-white rounded-3xl border border-line p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(16,56,50,0.05)]">
    //         <div className="mb-6">
    //           <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
    //             <span className="text-xs font-bold uppercase tracking-wider text-mint-deep flex items-center gap-1.5">
    //               <Sparkles className="w-3.5 h-3.5" />
    //               Virtual Consultation Desk
    //             </span>
    //             <span className="text-[11.5px] text-ink-soft bg-paper px-2.5 py-1 rounded-full border border-line flex items-center gap-1.5">
    //               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
    //               Live Video Waiting Room Ready
    //             </span>
    //           </div>
    //           <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
    //             Start Your Online Consultation
    //           </h2>
    //           <p className="text-sm text-ink-soft mt-1">
    //             Select your inquiry format and preferred video window. We will
    //             generate your secure room link instantly.
    //           </p>
    //         </div>

    //         {!isSubmitted ? (
    //           <form
    //             onSubmit={handleSubmit}
    //             className="space-y-6"
    //             id="online-consultation-form"
    //           >
    //             {/* 1. Inquiry Intent Tabs */}
    //             <div>
    //               <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
    //                 1. Consultation Type
    //               </label>
    //               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    //                 {[
    //                   {
    //                     id: "instant-video",
    //                     label: "Instant Video",
    //                     icon: Video,
    //                   },
    //                   {
    //                     id: "scheduled-video",
    //                     label: "Schedule Slot",
    //                     icon: Calendar,
    //                   },
    //                   {
    //                     id: "second-opinion",
    //                     label: "Scan / Quote Review",
    //                     icon: Stethoscope,
    //                   },
    //                   {
    //                     id: "general",
    //                     label: "General Question",
    //                     icon: MessageSquare,
    //                   },
    //                 ].map((tab) => {
    //                   const Icon = tab.icon;
    //                   const active = inquiryType === tab.id;
    //                   return (
    //                     <button
    //                       key={tab.id}
    //                       type="button"
    //                       onClick={() => setInquiryType(tab.id as any)}
    //                       className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
    //                         active
    //                           ? "bg-teal-deep text-white border-teal-deep shadow-xs"
    //                           : "bg-paper/80 border-line text-ink hover:bg-line-soft hover:border-mint/50"
    //                       }`}
    //                     >
    //                       <Icon
    //                         className={`w-4 h-4 mb-1.5 ${active ? "text-mint" : "text-ink-soft"}`}
    //                       />
    //                       <span>{tab.label}</span>
    //                     </button>
    //                   );
    //                 })}
    //               </div>
    //             </div>

    //             {/* 2. Patient Status & Preferred Video Platform */}
    //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
    //               <div>
    //                 <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
    //                   Patient Status
    //                 </label>
    //                 <div className="flex rounded-xl bg-paper p-1 border border-line">
    //                   <button
    //                     type="button"
    //                     onClick={() => setPatientType("new")}
    //                     className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
    //                       patientType === "new"
    //                         ? "bg-white text-teal-deep shadow-xs"
    //                         : "text-ink-soft hover:text-ink"
    //                     }`}
    //                   >
    //                     New Patient
    //                   </button>
    //                   <button
    //                     type="button"
    //                     onClick={() => setPatientType("registered")}
    //                     className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
    //                       patientType === "registered"
    //                         ? "bg-white text-teal-deep shadow-xs"
    //                         : "text-ink-soft hover:text-ink"
    //                     }`}
    //                   >
    //                     Returning Patient
    //                   </button>
    //                 </div>
    //               </div>

    //               <div>
    //                 <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
    //                   Preferred Video Room
    //                 </label>
    //                 <div className="flex rounded-xl bg-paper p-1 border border-line">
    //                   <button
    //                     type="button"
    //                     onClick={() => setPreferredPlatform("browser")}
    //                     className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
    //                       preferredPlatform === "browser"
    //                         ? "bg-white text-teal-deep shadow-xs"
    //                         : "text-ink-soft hover:text-ink"
    //                     }`}
    //                   >
    //                     <Laptop className="w-3 h-3 text-mint-deep" />
    //                     In-Browser
    //                   </button>
    //                   <button
    //                     type="button"
    //                     onClick={() => setPreferredPlatform("whatsapp")}
    //                     className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
    //                       preferredPlatform === "whatsapp"
    //                         ? "bg-white text-teal-deep shadow-xs"
    //                         : "text-ink-soft hover:text-ink"
    //                     }`}
    //                   >
    //                     <Smartphone className="w-3 h-3 text-emerald-600" />
    //                     WhatsApp
    //                   </button>
    //                   <button
    //                     type="button"
    //                     onClick={() => setPreferredPlatform("zoom")}
    //                     className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
    //                       preferredPlatform === "zoom"
    //                         ? "bg-white text-teal-deep shadow-xs"
    //                         : "text-ink-soft hover:text-ink"
    //                     }`}
    //                   >
    //                     <Video className="w-3 h-3 text-blue-600" />
    //                     Zoom
    //                   </button>
    //                 </div>
    //               </div>
    //             </div>

    //             {/* 3. Personal Contact Fields */}
    //             <div className="space-y-4 pt-1">
    //               <div>
    //                 <label
    //                   htmlFor="fullName"
    //                   className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
    //                 >
    //                   Full Name <span className="text-rose-500">*</span>
    //                 </label>
    //                 <div className="relative">
    //                   <input
    //                     type="text"
    //                     id="fullName"
    //                     required
    //                     placeholder="e.g. Jessica Taylor"
    //                     value={formData.fullName}
    //                     onChange={(e) =>
    //                       setFormData({ ...formData, fullName: e.target.value })
    //                     }
    //                     className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
    //                   />
    //                   <User className="w-4 h-4 text-ink-soft/60 absolute right-3.5 top-3.5 pointer-events-none" />
    //                 </div>
    //               </div>

    //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    //                 <div>
    //                   <label
    //                     htmlFor="email"
    //                     className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
    //                   >
    //                     Email Address <span className="text-rose-500">*</span>
    //                   </label>
    //                   <div className="relative">
    //                     <input
    //                       type="email"
    //                       id="email"
    //                       required
    //                       placeholder="jessica@example.com"
    //                       value={formData.email}
    //                       onChange={(e) =>
    //                         setFormData({ ...formData, email: e.target.value })
    //                       }
    //                       className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
    //                     />
    //                     <Mail className="w-4 h-4 text-ink-soft/60 absolute right-3.5 top-3.5 pointer-events-none" />
    //                   </div>
    //                 </div>

    //                 <div>
    //                   <label
    //                     htmlFor="phone"
    //                     className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
    //                   >
    //                     Phone / WhatsApp{" "}
    //                     <span className="text-rose-500">*</span>
    //                   </label>
    //                   <div className="relative">
    //                     <input
    //                       type="tel"
    //                       id="phone"
    //                       required
    //                       placeholder="+91 98765 43210"
    //                       value={formData.phone}
    //                       onChange={(e) =>
    //                         setFormData({ ...formData, phone: e.target.value })
    //                       }
    //                       className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
    //                     />
    //                     <Phone className="w-4 h-4 text-ink-soft/60 absolute right-3.5 top-3.5 pointer-events-none" />
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>

    //             {/* 4. Preferred Timing & Pharmacy ZIP */}
    //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
    //               <div>
    //                 <label
    //                   htmlFor="preferredTime"
    //                   className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
    //                 >
    //                   Preferred Video Slot
    //                 </label>
    //                 <select
    //                   id="preferredTime"
    //                   value={formData.preferredTime}
    //                   onChange={(e) =>
    //                     setFormData({
    //                       ...formData,
    //                       preferredTime: e.target.value,
    //                     })
    //                   }
    //                   className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15 cursor-pointer"
    //                 >
    //                   <option value="asap">
    //                     Urgent Triage (Next Available Doctor ~10 mins)
    //                   </option>
    //                   <option value="morning">
    //                     Morning Slot (8:00 AM – 12:00 PM EST)
    //                   </option>
    //                   <option value="afternoon">
    //                     Afternoon Slot (12:00 PM – 4:00 PM EST)
    //                   </option>
    //                   <option value="evening">
    //                     Evening Slot (4:00 PM – 9:00 PM EST)
    //                   </option>
    //                 </select>
    //               </div>

    //               <div>
    //                 <label
    //                   htmlFor="pharmacyZip"
    //                   className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5"
    //                 >
    //                   Local Pharmacy PIN / Zip (For Prescriptions)
    //                 </label>
    //                 <div className="relative">
    //                   <input
    //                     type="text"
    //                     id="pharmacyZip"
    //                     placeholder="e.g. 560038 or 10001"
    //                     value={formData.pharmacyZip}
    //                     onChange={(e) =>
    //                       setFormData({
    //                         ...formData,
    //                         pharmacyZip: e.target.value,
    //                       })
    //                     }
    //                     className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15"
    //                   />
    //                   <Pill className="w-4 h-4 text-ink-soft/60 absolute right-3.5 top-3.5 pointer-events-none" />
    //                 </div>
    //               </div>
    //             </div>

    //             {/* 5. Dental Concerns Checklist */}
    //             <div>
    //               <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
    //                 Primary Symptoms or Focus Area
    //               </label>
    //               <div className="flex flex-wrap gap-2">
    //                 {teleConcerns.map((concern) => {
    //                   const isSelected = selectedConcerns.includes(concern);
    //                   return (
    //                     <button
    //                       key={concern}
    //                       type="button"
    //                       onClick={() => toggleConcern(concern)}
    //                       className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
    //                         isSelected
    //                           ? "bg-mint-deep text-white border-mint-deep font-medium shadow-2xs"
    //                           : "bg-paper text-ink border-line hover:border-mint/60 hover:bg-white"
    //                       }`}
    //                     >
    //                       {isSelected && (
    //                         <Check className="w-3 h-3 inline mr-1" />
    //                       )}
    //                       {concern}
    //                     </button>
    //                   );
    //                 })}
    //               </div>
    //             </div>

    //             {/* 6. Message & Symptoms */}
    //             <div>
    //               <div className="flex items-center justify-between mb-1.5">
    //                 <label
    //                   htmlFor="message"
    //                   className="text-xs font-semibold text-ink uppercase tracking-wider"
    //                 >
    //                   Describe your pain level or dental inquiry
    //                 </label>
    //                 <span className="text-[11px] text-ink-soft">
    //                   {formData.message.length}/500 chars
    //                 </span>
    //               </div>
    //               <textarea
    //                 id="message"
    //                 rows={4}
    //                 maxLength={500}
    //                 placeholder="E.g., Throbbing pain in upper left molar for 2 days, sensitive to cold water, need prescription or second opinion..."
    //                 value={formData.message}
    //                 onChange={(e) =>
    //                   setFormData({ ...formData, message: e.target.value })
    //                 }
    //                 className="w-full text-sm px-4 py-3 rounded-xl border border-line bg-paper/30 text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-mint-deep focus:bg-white focus:ring-4 focus:ring-mint-deep/15 resize-y"
    //               />
    //             </div>

    //             {/* 7. Attachment Simulation for Photo or X-ray */}
    //             <div>
    //               <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
    //                 Upload Tooth Photo or Existing X-Ray (Optional)
    //               </label>
    //               {!attachedFile ? (
    //                 <div
    //                   onClick={() =>
    //                     setAttachedFile("tooth_photo_upper_molar.jpg (3.1 MB)")
    //                   }
    //                   className="border border-dashed border-line rounded-xl p-4 text-center bg-paper/40 hover:bg-white hover:border-mint-deep transition-all cursor-pointer group"
    //                 >
    //                   <Upload className="w-5 h-5 text-mint-deep mx-auto mb-1 group-hover:-translate-y-0.5 transition-transform" />
    //                   <span className="text-xs font-medium text-ink block">
    //                     Click to simulate uploading photo of tooth or previous
    //                     scan
    //                   </span>
    //                   <span className="text-[11px] text-ink-soft block mt-0.5">
    //                     Take a clear photo with phone camera • Supported: JPG,
    //                     PNG, PDF, DICOM
    //                   </span>
    //                 </div>
    //               ) : (
    //                 <div className="flex items-center justify-between p-3 rounded-xl bg-mint/10 border border-mint/30 text-xs">
    //                   <div className="flex items-center gap-2">
    //                     <FileText className="w-4 h-4 text-mint-deep" />
    //                     <span className="font-medium text-teal-deep">
    //                       {attachedFile}
    //                     </span>
    //                   </div>
    //                   <button
    //                     type="button"
    //                     onClick={() => setAttachedFile(null)}
    //                     className="text-ink-soft hover:text-rose-600 transition-colors p-1"
    //                   >
    //                     <X className="w-3.5 h-3.5" />
    //                   </button>
    //                 </div>
    //               )}
    //             </div>

    //             {/* Submit Button */}
    //             <div className="pt-2">
    //               <button
    //                 type="submit"
    //                 disabled={isSubmitting}
    //                 className="w-full py-4 rounded-xl bg-teal-deep hover:bg-mint-deep text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-75 cursor-pointer"
    //                 id="btn-submit-tele-consult"
    //               >
    //                 {isSubmitting ? (
    //                   <>
    //                     <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
    //                     <span>Initializing Encrypted Video Room...</span>
    //                   </>
    //                 ) : (
    //                   <>
    //                     <Video className="w-4 h-4 text-mint" />
    //                     <span>Request Video Consultation & Prescription</span>
    //                   </>
    //                 )}
    //               </button>
    //               <p className="text-center text-[11.5px] text-ink-soft mt-3">
    //                 Protected by 256-bit HIPAA encryption. Certified by American
    //                 Tele-Dentistry Association.
    //               </p>
    //             </div>
    //           </form>
    //         ) : (
    //           /* Success Confirmation Card with Virtual Room Link */
    //           <div className="p-8 rounded-2xl bg-gradient-to-b from-[#EFF8F4] to-white border border-mint/30 text-center animate-rise">
    //             <div className="w-16 h-16 rounded-full bg-mint/20 text-mint-deep flex items-center justify-center mx-auto mb-4">
    //               <CheckCircle2 className="w-8 h-8 text-mint-deep" />
    //             </div>
    //             <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-1">
    //               Virtual Consultation Request Registered
    //             </span>
    //             <h3 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep mb-2">
    //               Ready to Connect, {formData.fullName || "Valued Patient"}!
    //             </h3>
    //             <p className="text-sm text-ink-soft max-w-md mx-auto mb-6 leading-relaxed">
    //               Your case details have been routed to our on-duty
    //               tele-dentistry practitioner. An invitation link has been
    //               dispatched to{" "}
    //               <strong>
    //                 {formData.phone ? formData.phone : formData.email}
    //               </strong>
    //               .
    //             </p>

    //             <div className="bg-white p-5 rounded-2xl border border-line text-left max-w-sm mx-auto mb-6 text-xs space-y-2.5 shadow-2xs">
    //               <div className="flex justify-between items-center pb-2 border-b border-line/60">
    //                 <span className="text-ink-soft">Encrypted Room ID:</span>
    //                 <span className="font-bold text-teal-deep font-mono text-sm">
    //                   {roomToken}
    //                 </span>
    //               </div>
    //               <div className="flex justify-between">
    //                 <span className="text-ink-soft">Consultation Type:</span>
    //                 <span className="font-semibold text-ink capitalize">
    //                   {inquiryType.replace("-", " ")}
    //                 </span>
    //               </div>
    //               <div className="flex justify-between">
    //                 <span className="text-ink-soft">Platform:</span>
    //                 <span className="font-semibold text-ink capitalize">
    //                   {preferredPlatform} Video
    //                 </span>
    //               </div>
    //               {formData.pharmacyZip && (
    //                 <div className="flex justify-between">
    //                   <span className="text-ink-soft">Prescription Zip:</span>
    //                   <span className="font-semibold text-teal-deep">
    //                     {formData.pharmacyZip}
    //                   </span>
    //                 </div>
    //               )}
    //               <div className="flex justify-between">
    //                 <span className="text-ink-soft">Status:</span>
    //                 <span className="font-semibold text-emerald-600 flex items-center gap-1">
    //                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    //                   Doctor Assigned
    //                 </span>
    //               </div>
    //             </div>

    //             <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
    //               <button
    //                 type="button"
    //                 onClick={handleResetForm}
    //                 className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-line text-ink text-xs font-semibold hover:bg-paper transition-colors cursor-pointer"
    //               >
    //                 Submit Another Request
    //               </button>
    //               <Link
    //                 to="/services"
    //                 className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-deep text-white text-xs font-semibold hover:bg-mint-deep transition-colors inline-flex items-center justify-center gap-1.5"
    //               >
    //                 <span>View Tele-Services</span>
    //                 <ArrowRight className="w-3.5 h-3.5" />
    //               </Link>
    //             </div>
    //           </div>
    //         )}
    //       </div>

    //       {/* Right Column: Telehealth Active Status, Hours, Virtual Specialists (5 cols) */}
    //       <div className="lg:col-span-5 space-y-6">
    //         {/* Live Virtual Triage Status & Operating Hours Widget */}
    //         <div className="bg-white rounded-3xl border border-line p-6 sm:p-7 shadow-[0_4px_30px_rgba(16,56,50,0.05)]">
    //           <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-line/70">
    //             <div>
    //               <h3 className="font-display text-xl font-medium text-teal-deep">
    //                 Tele-Dentistry Hours
    //               </h3>
    //               <p className="text-xs text-ink-soft">
    //                 Live video consultations & triage
    //               </p>
    //             </div>

    //             <div
    //               className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
    //                 teleStatus.isOpen
    //                   ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    //                   : "bg-amber-50 text-amber-700 border border-amber-200"
    //               }`}
    //             >
    //               <span
    //                 className={`w-2 h-2 rounded-full ${
    //                   teleStatus.isOpen
    //                     ? "bg-emerald-500 animate-pulse"
    //                     : "bg-amber-500"
    //                 }`}
    //               />
    //               <span>{teleStatus.label}</span>
    //             </div>
    //           </div>

    //           <div className="text-xs text-ink-soft bg-paper/80 p-2.5 rounded-xl border border-line mb-4">
    //             <Clock className="w-3.5 h-3.5 text-mint-deep inline mr-1.5" />
    //             <span>{teleStatus.detail}</span>
    //           </div>

    //           {/* Weekly Virtual schedule rows */}
    //           <div className="space-y-1.5 text-xs">
    //             {virtualHours.map((sched) => {
    //               const isToday = sched.dayIndex === todayIndex;
    //               return (
    //                 <div
    //                   key={sched.day}
    //                   className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
    //                     isToday
    //                       ? "bg-teal-deep text-white font-semibold shadow-2xs"
    //                       : "text-ink hover:bg-paper"
    //                   }`}
    //                 >
    //                   <div className="flex items-center gap-2">
    //                     <span>{sched.day}</span>
    //                     {isToday && (
    //                       <span className="text-[10px] bg-mint text-teal-deep font-bold px-1.5 py-0.2 rounded uppercase">
    //                         Today
    //                       </span>
    //                     )}
    //                   </div>
    //                   <span
    //                     className={isToday ? "text-[#C7DDD4]" : "text-ink-soft"}
    //                   >
    //                     {sched.hours}
    //                   </span>
    //                 </div>
    //               );
    //             })}
    //           </div>

    //           <div className="mt-4 pt-4 border-t border-line/70 text-[11px] text-ink-soft flex items-center justify-between">
    //             <span>24/7 on-call triage for emergency pain & swelling.</span>
    //             <a
    //               href="tel:+918085478598"
    //               className="text-mint-deep font-semibold hover:underline"
    //             >
    //               Call Nurse Line
    //             </a>
    //           </div>
    //         </div>

    //         {/* Virtual Specialists & Tele-Departments */}
    //         <div className="bg-white rounded-3xl border border-line p-6 sm:p-7 shadow-[0_4px_30px_rgba(16,56,50,0.05)]">
    //           <h3 className="font-display text-xl font-medium text-teal-deep mb-1">
    //             Virtual Care Specialists
    //           </h3>
    //           <p className="text-xs text-ink-soft mb-4">
    //             Direct tele-dentistry lines for specific dental needs.
    //           </p>

    //           <div className="space-y-3.5">
    //             {virtualDepartments.map((dept) => (
    //               <div
    //                 key={dept.name}
    //                 className="p-3.5 rounded-2xl bg-paper/50 border border-line/80 hover:border-mint/50 transition-colors"
    //               >
    //                 <div className="flex items-start justify-between gap-2 mb-1">
    //                   <h4 className="font-semibold text-xs text-ink">
    //                     {dept.name}
    //                   </h4>
    //                   <span className="text-[10px] font-semibold text-teal-deep bg-mint/20 px-2 py-0.5 rounded-full">
    //                     {dept.badge}
    //                   </span>
    //                 </div>
    //                 <span className="text-[11px] text-mint-deep font-medium block mb-1">
    //                   {dept.lead}
    //                 </span>
    //                 <p className="text-[11.5px] text-ink-soft leading-tight mb-2.5">
    //                   {dept.focus}
    //                 </p>
    //                 <div className="flex items-center gap-3 text-[11px]">
    //                   <a
    //                     href={`tel:${dept.phone}`}
    //                     className="text-teal-deep hover:text-mint-deep font-medium flex items-center gap-1"
    //                   >
    //                     <Phone className="w-3 h-3 text-mint-deep" />
    //                     {dept.phone}
    //                   </a>
    //                   <span className="text-line">|</span>
    //                   <a
    //                     href={`mailto:${dept.email}`}
    //                     className="text-teal-deep hover:text-mint-deep font-medium flex items-center gap-1 truncate"
    //                   >
    //                     <Mail className="w-3 h-3 text-mint-deep" />
    //                     {dept.email}
    //                   </a>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         </div>

    //         {/* System Requirements & Browser Compatibility Badge */}
    //         <div className="bg-gradient-to-br from-teal-deep to-teal-mid text-white rounded-3xl p-6 shadow-sm">
    //           <div className="flex items-center gap-2 text-mint font-semibold text-xs uppercase tracking-wider mb-2">
    //             <Wifi className="w-4 h-4" />
    //             <span>Zero Downloads Required</span>
    //           </div>
    //           <h4 className="font-display text-lg font-medium text-white mb-2">
    //             Works on Any Device or Browser
    //           </h4>
    //           <p className="text-xs text-[#C7DDD4] leading-relaxed mb-4">
    //             Launch directly from Chrome, Safari, or your smartphone.
    //             Automatic camera and mic testing runs seamlessly as you enter
    //             the consultation room.
    //           </p>
    //           <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
    //             <div className="bg-white/10 p-2 rounded-xl border border-white/10">
    //               <Smartphone className="w-4 h-4 mx-auto mb-1 text-mint" />
    //               <span>iOS & Android</span>
    //             </div>
    //             <div className="bg-white/10 p-2 rounded-xl border border-white/10">
    //               <Laptop className="w-4 h-4 mx-auto mb-1 text-mint" />
    //               <span>Mac & PC</span>
    //             </div>
    //             <div className="bg-white/10 p-2 rounded-xl border border-white/10">
    //               <FileCheck className="w-4 h-4 mx-auto mb-1 text-mint" />
    //               <span>HIPAA Grade</span>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Tele-Dentistry FAQ Accordion */}
    //     <section className="mt-14">
    //       <div className="text-center max-w-2xl mx-auto mb-8">
    //         <span className="text-xs font-bold uppercase tracking-wider text-mint-deep block mb-1">
    //           Virtual Care Answers
    //         </span>
    //         <h2 className="font-display text-2xl sm:text-3xl font-medium text-teal-deep">
    //           Frequently Asked Questions About Online Consultations
    //         </h2>
    //         <p className="text-sm text-ink-soft mt-1">
    //           Everything you need to know about video triage, digital
    //           prescriptions, and insurance superbills.
    //         </p>
    //       </div>

    //       <div className="max-w-3xl mx-auto space-y-3">
    //         {teleFaqs.map((faq, index) => {
    //           const isOpen = openFaq === index;
    //           return (
    //             <div
    //               key={index}
    //               className="bg-white rounded-2xl border border-line overflow-hidden transition-all duration-200 shadow-[0_2px_12px_rgba(16,56,50,0.02)]"
    //             >
    //               <button
    //                 type="button"
    //                 onClick={() => setOpenFaq(isOpen ? null : index)}
    //                 className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm text-teal-deep hover:bg-paper/50 transition-colors cursor-pointer"
    //               >
    //                 <span>{faq.question}</span>
    //                 {isOpen ? (
    //                   <ChevronUp className="w-4 h-4 text-mint-deep shrink-0" />
    //                 ) : (
    //                   <ChevronDown className="w-4 h-4 text-ink-soft shrink-0" />
    //                 )}
    //               </button>
    //               {isOpen && (
    //                 <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-ink-soft leading-relaxed border-t border-line/50 bg-paper/20">
    //                   {faq.answer}
    //                 </div>
    //               )}
    //             </div>
    //           );
    //         })}
    //       </div>
    //     </section>

    //     {/* Urgent Emergency Callout Bar */}
    //     <section className="mt-14 bg-gradient-to-r from-teal-deep via-teal-mid to-[#14473F] rounded-3xl text-white p-8 sm:p-10 relative overflow-hidden shadow-lg">
    //       <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
    //         <div className="max-w-xl">
    //           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
    //             <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
    //             Experiencing Acute Pain or Dental Trauma?
    //           </div>
    //           <h3 className="font-display text-2xl sm:text-3xl font-medium mb-2">
    //             Connect with an On-Duty Doctor in Under 10 Minutes.
    //           </h3>
    //           <p className="text-sm text-[#C7DDD4] leading-relaxed">
    //             Skip emergency room waiting times. Our licensed tele-dentistry
    //             practitioners are standing by to inspect swelling, provide
    //             urgent advice, and dispatch electronic prescriptions directly to
    //             your nearest pharmacy.
    //           </p>
    //         </div>

    //         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
    //           <a
    //             href="tel:+918085478598"
    //             className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-teal-deep hover:bg-[#F3F7F4] font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
    //             id="btn-tele-emergency-call"
    //           >
    //             <Phone className="w-4 h-4 text-rose-600" />
    //             <span>Call +91 8085478598</span>
    //           </a>

    //           <Link
    //             to="/services"
    //             className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-mint hover:bg-mint-deep text-teal-deep hover:text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
    //             id="btn-tele-browse-services"
    //           >
    //             <Video className="w-4 h-4" />
    //             <span>Explore Online Services</span>
    //           </Link>
    //         </div>
    //       </div>
    //     </section>
    //   </main>

    //   <Footer />
    // </div>
  );
}
