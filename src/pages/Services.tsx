import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Search,
  Video,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  X,
  HelpCircle,
  Activity,
  Smile,
  Zap,
  Building2,
  Mail,
} from "lucide-react";

/**
 * Treatment codes below are the canonical values defined in the Scope of Work,
 * section 2 ("Treatment / Case Selection"). The booking form, admin filters
 * (SOW §11) and the "Appointments by treatment" report (SOW §11) all key off
 * these codes, so they must not be renamed here without a matching change in
 * the backend treatment-category settings (SOW §14).
 */
export type TreatmentCode =
  | "general_consultation"
  | "dental_implant"
  | "orthodontics"
  | "cosmetic_dentistry"
  | "root_canal"
  | "tooth_extraction"
  | "pediatric_dentistry"
  | "gum_treatment"
  | "crowns_bridges"
  | "other";

export type ConsultationType = "online" | "in_clinic";

export type ServiceGroup =
  | "consultation"
  | "preventive"
  | "restorative"
  | "cosmetic"
  | "surgical";

export interface DentalService {
  /** Slug used for deep links and anchors. */
  id: string;
  /** Canonical SOW treatment code sent to the booking form. */
  treatmentCode: TreatmentCode;
  /** Patient-facing label for the treatment. */
  name: string;
  group: ServiceGroup;
  groupLabel: string;
  shortDescription: string;
  fullDescription: string;
  /** Consultation types the clinic accepts requests for (SOW §14). */
  consultationTypes: ConsultationType[];
  /** Typical appointment length. Configurable per SOW §14. */
  duration: string;
  /**
   * Optional indicative fee. Phase 1 has no billing module (SOW §17), so this
   * is display-only and should be served from admin settings rather than
   * hardcoded. Left null in the seed data so no unverified price ships.
   */
  indicativeFee: string | null;
  features: string[];
  candidateFor: string[];
  procedureSteps: { title: string; desc: string }[];
  aftercare: string;
  faqs: { q: string; a: string }[];
}

/**
 * Seed data. Treated as a fallback only — the live list is loaded from the
 * admin-configurable treatment categories endpoint (SOW §14) so the Admin
 * Portal stays the single source of truth.
 */
const seedServices: DentalService[] = [
  {
    id: "general-consultation",
    treatmentCode: "general_consultation",
    name: "General Dental Consultation",
    group: "consultation",
    groupLabel: "Consultation",
    shortDescription:
      "Talk through symptoms, an existing treatment plan, or a second opinion with a dentist, online by video or in the clinic.",
    fullDescription:
      "A general consultation is the starting point for most patients. The dentist reviews your symptoms and dental history, discusses any treatment you have already been advised to have, and recommends next steps. You can request this as an online video consultation or as an in-clinic appointment.",
    consultationTypes: ["online", "in_clinic"],
    duration: "15–30 minutes",
    indicativeFee: null,
    features: [
      "Choose an online video consultation or an in-clinic visit",
      "Attach photos or documents to your request",
      "Written consultation notes and recommendations in your patient account",
      "Follow-up appointment arranged where the dentist advises one",
    ],
    candidateFor: [
      "New symptoms you want assessed before committing to treatment",
      "A second opinion on treatment you have been advised to have",
      "General questions about your oral health",
      "A follow-up after earlier treatment",
    ],
    procedureSteps: [
      {
        title: "Send your request",
        desc: "Enter your details, pick the treatment area, and give a preferred date and time.",
      },
      {
        title: "Clinic reviews the request",
        desc: "Staff review your case and either confirm your slot or propose an alternative time.",
      },
      {
        title: "Confirmation and joining details",
        desc: "Once approved you receive a confirmation email with the appointment details and, for online consultations, the meeting link.",
      },
      {
        title: "Consultation and notes",
        desc: "The dentist records findings, diagnosis, recommended treatment, and any follow-up in your record.",
      },
    ],
    aftercare: "No recovery time",
    faqs: [
      {
        q: "Is my slot confirmed as soon as I submit the form?",
        a: "No. Your request is saved with a reference number and a Pending status. The clinic reviews it and emails you once a date, time, and dentist are confirmed.",
      },
      {
        q: "What happens in an online consultation?",
        a: "You join a video meeting using the link in your confirmation email. The dentist discusses your symptoms, advises on next steps, and arranges an in-clinic visit if hands-on examination or treatment is needed.",
      },
    ],
  },
  {
    id: "gum-treatment",
    treatmentCode: "gum_treatment",
    name: "Gum Treatment",
    group: "preventive",
    groupLabel: "Preventive & Gum Care",
    shortDescription:
      "Assessment and treatment of bleeding, swollen, or receding gums, including scaling and gum-health monitoring.",
    fullDescription:
      "Gum disease is common and often painless in its early stages. Treatment begins with an assessment of gum health, followed by cleaning below the gum line where needed, and a maintenance plan. Early-stage gum problems respond well when treated promptly.",
    consultationTypes: ["online", "in_clinic"],
    duration: "30–60 minutes",
    indicativeFee: null,
    features: [
      "Gum health assessment and pocket-depth charting",
      "Scaling and cleaning below the gum line where indicated",
      "Home care plan tailored to your gum condition",
      "Review appointments to track improvement",
    ],
    candidateFor: [
      "Gums that bleed when you brush or floss",
      "Swollen, tender, or receding gums",
      "Persistent bad breath",
      "Routine maintenance if you have had gum treatment before",
    ],
    procedureSteps: [
      {
        title: "Gum assessment",
        desc: "The dentist checks gum condition and measures pocket depths around each tooth.",
      },
      {
        title: "Cleaning",
        desc: "Removal of hardened deposits above and, where needed, below the gum line.",
      },
      {
        title: "Home care plan",
        desc: "Brushing and cleaning technique adjusted to your specific problem areas.",
      },
      {
        title: "Review",
        desc: "A follow-up appointment to check whether the gums have responded.",
      },
    ],
    aftercare: "Mild gum tenderness for 1–2 days",
    faqs: [
      {
        q: "Can gum problems be assessed online?",
        a: "An online consultation is useful for discussing symptoms and deciding how urgently you need to be seen, but gum treatment itself requires an in-clinic appointment.",
      },
    ],
  },
  {
    id: "root-canal",
    treatmentCode: "root_canal",
    name: "Root Canal Treatment",
    group: "restorative",
    groupLabel: "Restorative",
    shortDescription:
      "Treatment for an infected or inflamed tooth nerve, keeping the natural tooth in place instead of extracting it.",
    fullDescription:
      "When decay or injury reaches the nerve inside a tooth, root canal treatment removes the infected tissue, disinfects the canals, and seals them. It relieves the pain caused by the infection and lets you keep the tooth. A crown is usually recommended afterwards to protect it.",
    consultationTypes: ["online", "in_clinic"],
    duration: "1–2 appointments",
    indicativeFee: null,
    features: [
      "Local anaesthetic throughout the procedure",
      "Diagnostic imaging to confirm the extent of infection",
      "Canals cleaned, shaped, and sealed",
      "Crown recommended afterwards in most cases",
    ],
    candidateFor: [
      "Persistent toothache, especially at night",
      "Prolonged sensitivity to hot or cold after the stimulus is removed",
      "A tooth that has darkened after an injury",
      "Swelling or a recurring gum boil near a tooth",
    ],
    procedureSteps: [
      {
        title: "Diagnosis",
        desc: "Examination and imaging to confirm the tooth and the extent of infection.",
      },
      {
        title: "Anaesthetic and access",
        desc: "The tooth is numbed and a small opening made to reach the nerve canals.",
      },
      {
        title: "Cleaning and shaping",
        desc: "Infected tissue is removed and the canals are disinfected and shaped.",
      },
      {
        title: "Sealing and restoration",
        desc: "The canals are sealed and the tooth restored, usually with a crown.",
      },
    ],
    aftercare: "Tenderness when biting for 2–4 days",
    faqs: [
      {
        q: "Is root canal treatment painful?",
        a: "The procedure is carried out under local anaesthetic. Most of the pain patients associate with root canals comes from the infection itself, which the treatment relieves.",
      },
      {
        q: "Do I need a crown afterwards?",
        a: "Usually yes. A treated tooth is more brittle, and a crown protects it from fracture. Your dentist will advise based on how much tooth structure remains.",
      },
    ],
  },
  {
    id: "crowns-bridges",
    treatmentCode: "crowns_bridges",
    name: "Dental Crowns & Bridges",
    group: "restorative",
    groupLabel: "Restorative",
    shortDescription:
      "Custom-made crowns to rebuild damaged teeth, and bridges to replace a missing tooth using the teeth on either side.",
    fullDescription:
      "A crown covers and protects a tooth that is heavily filled, cracked, or root-treated. A bridge replaces a missing tooth by anchoring to the neighbouring teeth. Both are made to match the shape and shade of your existing teeth.",
    consultationTypes: ["online", "in_clinic"],
    duration: "2 appointments",
    indicativeFee: null,
    features: [
      "Shade matched to your surrounding teeth",
      "Temporary crown worn while the permanent one is made",
      "Bite checked and adjusted at fitting",
      "Options in ceramic and metal-ceramic discussed before you commit",
    ],
    candidateFor: [
      "A tooth with extensive decay or a large old filling",
      "A cracked or weakened tooth",
      "A tooth that has had root canal treatment",
      "A single missing tooth with healthy teeth on either side",
    ],
    procedureSteps: [
      {
        title: "Assessment and planning",
        desc: "The dentist confirms whether a crown or bridge is the right option and discusses materials.",
      },
      {
        title: "Tooth preparation",
        desc: "Decay is removed and the tooth shaped, then an impression or scan is taken.",
      },
      {
        title: "Temporary restoration",
        desc: "A temporary crown protects the tooth while the permanent one is made.",
      },
      {
        title: "Fitting",
        desc: "The final restoration is fitted, the bite checked, and adjustments made.",
      },
    ],
    aftercare: "Normal eating within a few hours",
    faqs: [
      {
        q: "How long does a crown last?",
        a: "Longevity depends on the material, your bite, and your oral hygiene. Your dentist will give you a realistic expectation for your specific case at the consultation.",
      },
    ],
  },
  {
    id: "dental-implant",
    treatmentCode: "dental_implant",
    name: "Dental Implant",
    group: "surgical",
    groupLabel: "Surgical",
    shortDescription:
      "A replacement tooth root placed in the jaw, supporting a crown, bridge, or denture that stays fixed in place.",
    fullDescription:
      "An implant replaces the root of a missing tooth. Once it has integrated with the jawbone, a crown is attached to it. Implants avoid the need to reshape neighbouring teeth and are assessed case by case, since bone volume and general health both affect suitability.",
    consultationTypes: ["online", "in_clinic"],
    duration: "Staged over several months",
    indicativeFee: null,
    features: [
      "Imaging and bone assessment before any surgery",
      "Written treatment plan with stages and timelines",
      "Does not require reshaping the neighbouring teeth",
      "Options for single teeth or multiple missing teeth",
    ],
    candidateFor: [
      "One or more missing teeth",
      "A tooth that cannot be saved and needs replacing",
      "Loose or uncomfortable dentures",
      "Sufficient jawbone, or willingness to consider bone grafting",
    ],
    procedureSteps: [
      {
        title: "Assessment and imaging",
        desc: "Imaging to assess bone volume and the position of nerves and sinuses.",
      },
      {
        title: "Implant placement",
        desc: "The implant is placed under local anaesthetic, with sedation available.",
      },
      {
        title: "Healing period",
        desc: "The implant integrates with the bone over several months.",
      },
      {
        title: "Crown fitting",
        desc: "A custom crown is attached once healing is confirmed.",
      },
    ],
    aftercare: "Swelling and discomfort for 2–4 days",
    faqs: [
      {
        q: "Am I a suitable candidate?",
        a: "Suitability depends on bone volume, gum health, smoking, and certain medical conditions. This is assessed at the consultation, including imaging, before any plan is agreed.",
      },
    ],
  },
  {
    id: "tooth-extraction",
    treatmentCode: "tooth_extraction",
    name: "Tooth Extraction",
    group: "surgical",
    groupLabel: "Surgical",
    shortDescription:
      "Removal of a tooth that cannot be saved, including wisdom teeth, with aftercare instructions and replacement options discussed.",
    fullDescription:
      "Extraction is recommended when a tooth cannot be restored, is causing crowding, or is impacted. The dentist explains why removal is being advised, what the alternatives are, and how the gap can be replaced if needed.",
    consultationTypes: ["online", "in_clinic"],
    duration: "20–45 minutes",
    indicativeFee: null,
    features: [
      "Reason for removal and alternatives explained first",
      "Local anaesthetic, with sedation available for complex cases",
      "Written aftercare instructions",
      "Replacement options discussed before the extraction",
    ],
    candidateFor: [
      "A tooth broken or decayed beyond repair",
      "Painful, impacted, or repeatedly infected wisdom teeth",
      "Severe gum disease affecting a specific tooth",
      "Crowding as part of an orthodontic plan",
    ],
    procedureSteps: [
      {
        title: "Assessment",
        desc: "Examination and imaging to plan the extraction and check the root position.",
      },
      {
        title: "Anaesthetic",
        desc: "The area is fully numbed before any work begins.",
      },
      {
        title: "Removal",
        desc: "The tooth is removed, with stitches placed if needed.",
      },
      {
        title: "Aftercare",
        desc: "Instructions on bleeding, pain relief, and healing, plus a review if required.",
      },
    ],
    aftercare: "Healing over 7–10 days",
    faqs: [
      {
        q: "What do I do if the socket keeps bleeding?",
        a: "Bite firmly on clean gauze for 20 minutes and avoid rinsing. If bleeding continues beyond that, contact the clinic — the aftercare sheet you receive includes the number to call.",
      },
    ],
  },
  {
    id: "orthodontics",
    treatmentCode: "orthodontics",
    name: "Orthodontics",
    group: "cosmetic",
    groupLabel: "Cosmetic & Orthodontics",
    shortDescription:
      "Straightening crooked or crowded teeth and correcting bite problems using braces or removable clear aligners.",
    fullDescription:
      "Orthodontic treatment moves teeth into a better position over several months. Fixed braces and removable clear aligners both have advantages depending on the case. The consultation covers which options suit your teeth, roughly how long treatment will take, and what retainers you will need afterwards.",
    consultationTypes: ["online", "in_clinic"],
    duration: "6–24 months",
    indicativeFee: null,
    features: [
      "Fixed brace and removable clear aligner options compared",
      "Records and scans taken before treatment planning",
      "Regular review appointments through treatment",
      "Retainers provided to hold the result",
    ],
    candidateFor: [
      "Crowded or overlapping teeth",
      "Gaps between teeth",
      "Overbite, underbite, or crossbite",
      "Teens and adults who have completed jaw growth",
    ],
    procedureSteps: [
      {
        title: "Initial consultation",
        desc: "Discussion of what you want to change and whether orthodontics can achieve it.",
      },
      {
        title: "Records and planning",
        desc: "Scans, photographs, and imaging taken in clinic to plan tooth movement.",
      },
      {
        title: "Active treatment",
        desc: "Braces fitted or aligners issued, with reviews at set intervals.",
      },
      {
        title: "Retention",
        desc: "Retainers fitted at the end of treatment to hold teeth in position.",
      },
    ],
    aftercare: "Pressure and tenderness for 2–3 days after each adjustment",
    faqs: [
      {
        q: "Can the whole treatment be done online?",
        a: "No. The first discussion and some progress reviews can be done by video, but records, fitting, and adjustments all require in-clinic appointments.",
      },
      {
        q: "How long will I need to wear a retainer?",
        a: "Teeth move throughout life, so retainers are usually recommended long term. Your orthodontist will explain the wear schedule for your case.",
      },
    ],
  },
  {
    id: "cosmetic-dentistry",
    treatmentCode: "cosmetic_dentistry",
    name: "Cosmetic Dentistry",
    group: "cosmetic",
    groupLabel: "Cosmetic & Orthodontics",
    shortDescription:
      "Whitening, bonding, and veneers to improve the colour, shape, and evenness of your teeth.",
    fullDescription:
      "Cosmetic treatment covers professional whitening for discoloured teeth, composite bonding to repair chips and small gaps, and veneers to change the shape and shade of front teeth. The consultation sets out what each option can realistically achieve for your teeth, and what it involves.",
    consultationTypes: ["online", "in_clinic"],
    duration: "1–3 appointments",
    indicativeFee: null,
    features: [
      "Whitening, bonding, and veneer options explained and compared",
      "Shade and shape agreed with you before treatment",
      "Health of the teeth and gums checked first",
      "Written plan setting out stages and what is reversible",
    ],
    candidateFor: [
      "Discoloured or stained teeth",
      "Chipped, worn, or uneven front teeth",
      "Small gaps between front teeth",
      "Wanting to understand the options before deciding",
    ],
    procedureSteps: [
      {
        title: "Consultation",
        desc: "Discussion of what you want to change and which options can achieve it.",
      },
      {
        title: "Health check",
        desc: "Decay and gum problems are treated before any cosmetic work begins.",
      },
      {
        title: "Planning and preview",
        desc: "Shade and shape agreed, with a preview where the treatment allows for one.",
      },
      {
        title: "Treatment",
        desc: "Whitening, bonding, or veneer fitting carried out over one or more visits.",
      },
    ],
    aftercare: "Avoid staining food and drink for 48 hours after whitening",
    faqs: [
      {
        q: "Is whitening safe for my enamel?",
        a: "Professional whitening carried out by a dentist is well established. Some people experience temporary sensitivity. The dentist checks your teeth are suitable before starting.",
      },
      {
        q: "Are veneers reversible?",
        a: "Most veneers require some enamel to be removed, which cannot be replaced. Your dentist will tell you which options are reversible and which are not before you decide.",
      },
    ],
  },
  {
    id: "pediatric-dentistry",
    treatmentCode: "pediatric_dentistry",
    name: "Pediatric Dentistry",
    group: "preventive",
    groupLabel: "Preventive & Gum Care",
    shortDescription:
      "Check-ups, fluoride, and sealants for children, with early monitoring of how adult teeth are coming through.",
    fullDescription:
      "Children's appointments are paced so that a first visit is a positive experience. Care covers routine check-ups, preventive treatments such as fluoride varnish and fissure sealants, and monitoring of tooth development and bite as adult teeth appear.",
    consultationTypes: ["online", "in_clinic"],
    duration: "20–40 minutes",
    indicativeFee: null,
    features: [
      "Unhurried first visits to build familiarity",
      "Fluoride varnish and fissure sealants to prevent decay",
      "Monitoring of tooth development and bite",
      "Brushing and diet guidance for parents",
    ],
    candidateFor: [
      "A child's first dental visit",
      "Routine check-ups for school-age children",
      "Preventing decay in newly erupted adult molars",
      "Children who are anxious about the dentist",
    ],
    procedureSteps: [
      {
        title: "Getting comfortable",
        desc: "Time for your child to look around and meet the dentist before anything happens.",
      },
      {
        title: "Examination",
        desc: "A check of tooth condition, gums, and how the bite is developing.",
      },
      {
        title: "Preventive treatment",
        desc: "Fluoride varnish or sealants applied where they will help.",
      },
      {
        title: "Guidance for parents",
        desc: "Practical advice on brushing, diet, and when to come back.",
      },
    ],
    aftercare: "No recovery time",
    faqs: [
      {
        q: "When should my child first see a dentist?",
        a: "Guidance generally suggests the first visit around a child's first birthday, or when their first tooth appears — whichever comes first.",
      },
    ],
  },
  {
    id: "other",
    treatmentCode: "other",
    name: "Something else",
    group: "consultation",
    groupLabel: "Consultation",
    shortDescription:
      "Not sure which category fits? Describe your situation in the request and the clinic will direct it to the right dentist.",
    fullDescription:
      "If your concern does not match any of the categories above, send a request with a description of the problem. Clinic staff review every request and assign it to a dentist with the relevant expertise before confirming an appointment.",
    consultationTypes: ["online", "in_clinic"],
    duration: "Depends on the case",
    indicativeFee: null,
    features: [
      "Describe the problem in your own words",
      "Attach photos or previous reports to your request",
      "Reviewed by clinic staff and assigned to a suitable dentist",
      "Online or in-clinic, whichever the case needs",
    ],
    candidateFor: [
      "Symptoms you cannot categorise",
      "Questions about treatment you had elsewhere",
      "Jaw pain, clicking, or grinding",
      "Anything not covered by the other categories",
    ],
    procedureSteps: [
      {
        title: "Describe your case",
        desc: "Fill in the request form and use the description field to explain the problem.",
      },
      {
        title: "Clinic review",
        desc: "Staff review the request and assign it to an appropriate dentist.",
      },
      {
        title: "Confirmation",
        desc: "You receive an email with the confirmed date, time, and joining details.",
      },
      {
        title: "Consultation",
        desc: "The dentist assesses your case and records findings and recommendations.",
      },
    ],
    aftercare: "Depends on the case",
    faqs: [
      {
        q: "Will my request be turned away if I pick the wrong category?",
        a: "No. Staff reassign requests to the correct treatment category during review, and you will be told if that changes anything about your appointment.",
      },
    ],
  },
];

const groups: { id: ServiceGroup | "all"; label: string }[] = [
  { id: "all", label: "All treatments" },
  { id: "consultation", label: "Consultation" },
  { id: "preventive", label: "Preventive & gum care" },
  { id: "restorative", label: "Restorative" },
  { id: "surgical", label: "Surgical" },
  { id: "cosmetic", label: "Cosmetic & orthodontics" },
];

const consultationFilters: { id: ConsultationType | "all"; label: string }[] = [
  { id: "all", label: "Any format" },
  { id: "online", label: "Online video" },
  { id: "in_clinic", label: "In clinic" },
];

const symptomSuggestions: { symptom: string; targetId: string }[] = [
  { symptom: "Toothache that keeps me awake", targetId: "root-canal" },
  { symptom: "Crooked or crowded teeth", targetId: "orthodontics" },
  { symptom: "Discoloured teeth", targetId: "cosmetic-dentistry" },
  { symptom: "Missing tooth", targetId: "dental-implant" },
  { symptom: "Gums bleed when I brush", targetId: "gum-treatment" },
  { symptom: "Want a second opinion", targetId: "general-consultation" },
];

/** Builds the booking link, carrying the treatment into the request form. */
function bookingHref(service: DentalService, type?: ConsultationType) {
  const params = new URLSearchParams({
    redirect: "/appointments/new",
    treatment: service.treatmentCode,
  });
  if (type) params.set("consultationType", type);
  return `/auth/register?${params.toString()}`;
}

function consultationLabel(types: ConsultationType[]) {
  if (types.includes("online") && types.includes("in_clinic")) {
    return "Online or in clinic";
  }
  return types.includes("online") ? "Online video" : "In clinic";
}

export default function Services() {
  const [services, setServices] = useState<DentalService[]>(seedServices);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<ServiceGroup | "all">(
    "all",
  );
  const [consultationFilter, setConsultationFilter] = useState<
    ConsultationType | "all"
  >("all");
  const [selectedService, setSelectedService] = useState<DentalService | null>(
    null,
  );

  // Treatment categories are admin-configurable (SOW §14). Fall back to the
  // seed list if the endpoint is unavailable so the page still renders.
  useEffect(() => {
    let active = true;
    fetch("/api/settings/treatments")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: DentalService[]) => {
        if (active && Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => {
        /* seed list already in state */
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      const matchesSearch =
        query === "" ||
        service.name.toLowerCase().includes(query) ||
        service.shortDescription.toLowerCase().includes(query) ||
        service.candidateFor.some((c) => c.toLowerCase().includes(query)) ||
        service.features.some((f) => f.toLowerCase().includes(query));

      const matchesGroup =
        selectedGroup === "all" || service.group === selectedGroup;

      const matchesConsultation =
        consultationFilter === "all" ||
        service.consultationTypes.includes(consultationFilter);

      return matchesSearch && matchesGroup && matchesConsultation;
    });
  }, [services, searchQuery, selectedGroup, consultationFilter]);

  const handleSymptomClick = (targetId: string) => {
    const service = services.find((s) => s.id === targetId);
    if (!service) return;
    setSelectedGroup("all");
    setSearchQuery("");
    setConsultationFilter("all");
    setSelectedService(service);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGroup("all");
    setConsultationFilter("all");
  };

  const filtersActive =
    searchQuery !== "" || selectedGroup !== "all" || consultationFilter !== "all";

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-ink selection:bg-mint/30 selection:text-teal-deep">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-teal-deep text-paper pt-14 pb-20 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(79, 169, 138, 0.4) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="font-display font-medium text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12] max-w-4xl mx-auto mb-6">
            Dental care you can arrange from home
          </h1>

          <p className="text-base sm:text-lg text-[#D2E4DC] max-w-2xl mx-auto leading-relaxed mb-10">
            Send an appointment request for any treatment below. The clinic
            reviews it, confirms a time with you by email, and sends a meeting
            link if you have chosen an online consultation.
          </p>

          {/* How requests work — matches the status flow in the scope */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-12 text-left">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <Video className="w-4 h-4 text-mint mb-2" />
              <span className="text-sm text-white font-medium block mb-1">
                Online or in clinic
              </span>
              <span className="text-xs text-[#A8C4B8] leading-relaxed">
                Choose the format when you send your request.
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <Clock className="w-4 h-4 text-mint mb-2" />
              <span className="text-sm text-white font-medium block mb-1">
                Reviewed before confirming
              </span>
              <span className="text-xs text-[#A8C4B8] leading-relaxed">
                Requests start as pending. Staff confirm your slot or propose
                another time.
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <Mail className="w-4 h-4 text-mint mb-2" />
              <span className="text-sm text-white font-medium block mb-1">
                Email confirmation and reminders
              </span>
              <span className="text-xs text-[#A8C4B8] leading-relaxed">
                Details, joining link, and reminders before your appointment.
              </span>
            </div>
          </div>

          {/* Search & format filter */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2 border border-line/80">
            <div className="flex items-center gap-3 w-full px-3 py-2 text-ink">
              <Search className="w-5 h-5 text-mint-deep shrink-0" />
              <label htmlFor="treatment-search" className="sr-only">
                Search treatments
              </label>
              <input
                id="treatment-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search treatments or symptoms"
                className="w-full bg-transparent text-sm text-ink placeholder:text-[#A4B5AD] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-ink-soft hover:text-ink text-xs p-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div
              className="w-full sm:w-auto flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-line px-2 py-1"
              role="group"
              aria-label="Filter by consultation format"
            >
              {consultationFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setConsultationFilter(f.id)}
                  aria-pressed={consultationFilter === f.id}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep ${
                    consultationFilter === f.id
                      ? "bg-teal-deep text-paper"
                      : "text-teal-deep hover:bg-[#EDF6F2]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Symptom shortcuts */}
      <section className="bg-[#EDF5F1] border-y border-[#D6E6DE] py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-deep shrink-0">
            <Activity className="w-4 h-4 text-mint-deep" />
            <span>Common reasons patients book</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {symptomSuggestions.map((item) => (
              <button
                key={item.symptom}
                type="button"
                onClick={() => handleSymptomClick(item.targetId)}
                className="px-3 py-1.5 rounded-lg bg-white border border-line hover:border-mint-deep text-xs font-medium text-ink-soft hover:text-teal-deep transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
              >
                {item.symptom}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grow w-full">
        {/* Group filter */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none"
          role="group"
          aria-label="Filter by treatment area"
        >
          {groups.map((group) => {
            const isSelected = selectedGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroup(group.id)}
                aria-pressed={isSelected}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep ${
                  isSelected
                    ? "bg-teal-deep text-white"
                    : "bg-white text-ink-soft border border-line hover:border-teal-deep/30 hover:text-ink"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="font-display font-medium text-2xl text-ink">
              {groups.find((g) => g.id === selectedGroup)?.label}
            </h2>
            <p
              className="text-xs sm:text-sm text-ink-soft mt-0.5"
              aria-live="polite"
            >
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "treatment" : "treatments"}
            </p>
          </div>

          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-mint-deep hover:text-teal-deep underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Treatment grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-line max-w-lg mx-auto">
            <h3 className="font-display text-xl font-medium text-ink mb-2">
              No treatments match these filters
            </h3>
            <p className="text-sm text-ink-soft mb-6">
              Clear the filters to see everything, or send a request under
              “Something else” and describe your case.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-teal-deep text-white text-sm font-semibold hover:bg-mint-deep transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            id="services-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-line flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold tracking-wide text-mint-deep bg-[#EDF6F2] px-2.5 py-1 rounded-md">
                      {service.groupLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-deep bg-[#D8EFE5] px-2 py-0.5 rounded-md">
                      {service.consultationTypes.includes("online") ? (
                        <Video className="w-3 h-3" />
                      ) : (
                        <Building2 className="w-3 h-3" />
                      )}
                      <span>{consultationLabel(service.consultationTypes)}</span>
                    </span>
                  </div>

                  <h3 className="font-display font-medium text-xl text-ink mb-2 leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-[13.5px] text-ink-soft leading-relaxed mb-5">
                    {service.shortDescription}
                  </p>

                  <div className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-[#F8FAF9] border border-line/60 text-xs text-ink-soft mb-5">
                    <Clock className="w-3.5 h-3.5 text-mint-deep shrink-0" />
                    <span>{service.duration}</span>
                    {service.indicativeFee && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-line" />
                        <span className="text-ink font-semibold">
                          {service.indicativeFee}
                        </span>
                        <span className="text-[11px]">indicative</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2 mb-2">
                    {service.features.slice(0, 3).map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-ink-soft"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-mint-deep shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 border-t border-line/80 bg-[#FAFCFB] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-white hover:border-mint-deep transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep"
                  >
                    Read more
                  </button>

                  <Link
                    to={bookingHref(service)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-teal-deep hover:bg-mint-deep text-paper text-xs font-semibold transition-colors text-center flex items-center justify-center gap-1"
                  >
                    <span>Request appointment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How booking works */}
        <section className="mt-20 pt-16 border-t border-line">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-3xl font-medium text-ink mb-3">
              How booking works
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Every appointment goes through the same four stages, whether you
              are seen online or in the clinic. You can check where your request
              has reached at any time in your patient account.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "You send a request",
                body: "Enter your details, choose a treatment, and give a preferred date and time. You get a reference number straight away.",
              },
              {
                title: "The clinic reviews it",
                body: "Staff check the case, assign a dentist, and either confirm your preferred time or propose an alternative.",
              },
              {
                title: "You get a confirmation",
                body: "An email confirms the date, time, dentist, and consultation type, with a meeting link for online appointments.",
              },
              {
                title: "Consultation and notes",
                body: "After the appointment the dentist records findings, recommended treatment, and any follow-up in your record.",
              },
            ].map((step, idx) => (
              <li
                key={step.title}
                className="bg-white p-6 rounded-2xl border border-line"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-deep text-white font-display font-bold text-sm flex items-center justify-center mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-display font-medium text-base text-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Closing CTA */}
        <section className="mt-16 bg-teal-deep rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-mint text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Before any treatment
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-medium mb-4">
              You get the reasoning and a written estimate first
            </h2>
            <p className="text-sm sm:text-base text-[#D4E4DC] leading-relaxed mb-8">
              Your dentist explains why a treatment is being recommended, what
              the alternatives are, and what it will cost, before anything is
              agreed. Consultation notes and recommendations stay available in
              your patient account.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/appointment"
                className="px-6 py-3 rounded-xl bg-mint text-[#0C2420] text-sm font-semibold hover:bg-[#5EC29F] transition-colors flex items-center gap-2"
              >
                <span>Request an appointment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+918085478598"
                className="px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Call reception
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Treatment detail dialog */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-dialog-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedService(null);
          }}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-line relative text-ink">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-line flex items-start justify-between gap-4 z-10">
              <div>
                <span className="text-[11px] font-bold tracking-wide text-mint-deep bg-[#EDF6F2] px-2.5 py-0.5 rounded-md">
                  {selectedService.groupLabel}
                </span>
                <h3
                  id="service-dialog-title"
                  className="font-display font-medium text-xl text-ink mt-1"
                >
                  {selectedService.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-line-soft transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F8FAF9] rounded-2xl border border-line/60 text-center">
                <div>
                  <span className="text-xs text-ink-soft block">Format</span>
                  <span className="font-display font-semibold text-teal-deep text-sm">
                    {consultationLabel(selectedService.consultationTypes)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft block">
                    Appointment length
                  </span>
                  <span className="font-display font-semibold text-teal-deep text-sm">
                    {selectedService.duration}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft block">Aftercare</span>
                  <span className="font-display font-semibold text-teal-deep text-sm">
                    {selectedService.aftercare}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-ink mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-mint-deep" />
                  About this treatment
                </h4>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {selectedService.fullDescription}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-ink mb-2 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-mint-deep" />
                  Patients usually book this for
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedService.candidateFor.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-ink-soft bg-[#F9FBF9] p-2.5 rounded-xl border border-line/50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-mint-deep shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-ink-soft mt-2 leading-relaxed">
                  This is general information, not a diagnosis. Whether the
                  treatment suits you is decided at the consultation.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-ink mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-mint-deep" />
                  What happens
                </h4>
                <ol className="space-y-2.5">
                  {selectedService.procedureSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs">
                      <span className="w-5 h-5 rounded-full bg-teal-deep text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>
                        <span className="font-semibold text-ink block">
                          {step.title}
                        </span>
                        <span className="text-ink-soft leading-relaxed">
                          {step.desc}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedService.faqs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-ink mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-mint-deep" />
                    Common questions
                  </h4>
                  <div className="space-y-2">
                    {selectedService.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#F8FAF9] rounded-xl border border-line text-xs"
                      >
                        <span className="font-semibold text-ink block mb-1">
                          {faq.q}
                        </span>
                        <span className="text-ink-soft leading-relaxed">
                          {faq.a}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 border-t border-line flex flex-col sm:flex-row items-stretch gap-2">
              {selectedService.consultationTypes.includes("online") && (
                <Link
                  to={bookingHref(selectedService, "online")}
                  className="flex-1 py-3 rounded-xl border border-teal-deep text-xs font-semibold text-teal-deep hover:bg-[#EDF6F2] transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Request online consultation</span>
                </Link>
              )}
              {selectedService.consultationTypes.includes("in_clinic") && (
                <Link
                  to={bookingHref(selectedService, "in_clinic")}
                  className="flex-1 py-3 rounded-xl bg-teal-deep hover:bg-mint-deep text-white text-xs font-semibold transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Request clinic appointment</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}