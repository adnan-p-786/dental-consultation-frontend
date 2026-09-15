import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Search,
  Video,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  X,
  Star,
  HelpCircle,
  Activity,
  Smile,
  Zap,
} from "lucide-react";

export interface DentalService {
  id: string;
  name: string;
  category: "virtual" | "cosmetic" | "orthodontics" | "restorative" | "preventive" | "emergency";
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  priceStartingAt: string;
  virtualAvailable: boolean;
  popular?: boolean;
  features: string[];
  candidateFor: string[];
  procedureSteps: { title: string; desc: string }[];
  recoveryTime: string;
  faqs: { q: string; a: string }[];
}

const servicesData: DentalService[] = [
  {
    id: "virtual-triage",
    name: "Online Video Dental Triage & Second Opinion",
    category: "virtual",
    categoryLabel: "Video Consultations",
    shortDescription: "Meet with an accredited dental specialist over secure HD video to assess symptoms, review X-rays, and get instant prescriptions.",
    fullDescription: "Our tele-dentistry consultation connects you directly with a licensed dental practitioner from the comfort of your home. Perfect for sudden toothache evaluation, treatment plan second opinions, cosmetic consultations, and post-procedure follow-ups without traveling to the clinic.",
    duration: "15–20 mins",
    priceStartingAt: "$39",
    virtualAvailable: true,
    popular: true,
    features: [
      "Immediate video triage with on-duty dentist",
      "Digital prescription sent to your local pharmacy",
      "Review of external X-rays, scans & estimates",
      "Direct fast-track clinic booking if hands-on care is needed",
    ],
    candidateFor: [
      "Mild to moderate tooth pain or sensitivity",
      "Wanting advice on cosmetic or aligner treatment",
      "Second opinions on expensive treatment recommendations",
      "Post-surgery check-ins while traveling or recovering",
    ],
    procedureSteps: [
      { title: "Book Online Slot", desc: "Select your preferred doctor and instant appointment time." },
      { title: "Upload Photos / Scans", desc: "Attach photos of your tooth or previous dental X-rays securely." },
      { title: "1-on-1 Video Consultation", desc: "Discuss symptoms, receive clinical triage and recommended steps." },
      { title: "Digital Prescription & Notes", desc: "Access care notes and prescriptions instantly in your patient portal." },
    ],
    recoveryTime: "Immediate",
    faqs: [
      {
        q: "Can a dentist prescribe antibiotics via video?",
        a: "Yes. When clinically indicated for dental infections, our licensed dentists can prescribe antibiotics and pain relief directly to your preferred pharmacy.",
      },
      {
        q: "What if I need immediate physical treatment?",
        a: "Your virtual dentist will directly reserve an expedited, same-day chairside appointment at Cedarview Clinic.",
      },
    ],
  },
  {
    id: "invisalign-aligners",
    name: "Invisalign® & Custom Clear Aligners",
    category: "orthodontics",
    categoryLabel: "Orthodontics",
    shortDescription: "Discreetly straighten crooked teeth, close gaps, and correct bite issues with custom-engineered 3D transparent aligners.",
    fullDescription: "Experience modern orthodontic care without metal brackets or wires. Using our state-of-the-art iTero 3D digital scanner, we map your entire smile transformation before treatment starts. Track progress virtually through our patient app with fewer in-person clinic visits.",
    duration: "6–18 months",
    priceStartingAt: "$2,400",
    virtualAvailable: true,
    popular: true,
    features: [
      "High-precision 3D digital outcome simulation (ClinCheck®)",
      "Virtually invisible, removable, stain-resistant aligners",
      "Bi-weekly aligner switches with app-based check-ins",
      "Includes premium Vivera® post-treatment retainers",
    ],
    candidateFor: [
      "Crowded or overlapping front teeth",
      "Diastema (spaces and gaps between teeth)",
      "Mild to moderate overbite, underbite, or crossbite",
      "Adults & teens seeking aesthetic orthodontic solutions",
    ],
    procedureSteps: [
      { title: "Virtual Smile Assessment", desc: "Initial virtual review of your smile photos to confirm candidacy." },
      { title: "3D Digital Intraoral Scan", desc: "Zero-mess optical scan creating an exact 3D model of your teeth." },
      { title: "Custom Aligner Fabrication", desc: "Your tailored aligner sets are produced with SmartTrack® material." },
      { title: "Remote Progress Monitoring", desc: "Check in periodically via photo submissions or quick in-clinic visits." },
    ],
    recoveryTime: "None (mild initial pressure for 24-48h)",
    faqs: [
      {
        q: "How many hours per day do I wear aligners?",
        a: "Aligners must be worn 20 to 22 hours per day, removing them only to eat, drink warm beverages, and brush.",
      },
      {
        q: "Are video consultations enough for aligners?",
        a: "You can do initial screening and routine check-ins virtually; one in-clinic 3D digital scan is required to fabricate your aligners.",
      },
    ],
  },
  {
    id: "porcelain-veneers",
    name: "Porcelain Veneers & Smile Makeover",
    category: "cosmetic",
    categoryLabel: "Cosmetic Dentistry",
    shortDescription: "Ultra-thin, custom-shaded medical porcelain shells sculpted to correct discoloration, chipped edges, and asymmetry.",
    fullDescription: "Transform your smile with bespoke ultra-thin ceramic veneers handcrafted by master dental ceramists. We design each tooth considering facial proportions, natural shade gradients, and gum contours for an effortless, radiant smile that lasts 15+ years.",
    duration: "2 visits (1–2 weeks)",
    priceStartingAt: "$650 / tooth",
    virtualAvailable: true,
    popular: true,
    features: [
      "Digital Smile Design (DSD) preview before any prep",
      "Stain-proof, ultra-durable lithium disilicate porcelain",
      "Minimally invasive micro-enamel preparation",
      "10-year aesthetic guarantee",
    ],
    candidateFor: [
      "Stubborn internal staining resistant to whitening",
      "Worn, chipped, or uneven tooth enamel",
      "Gaps or slightly rotated anterior teeth",
      "Desire for a permanent Hollywood smile transformation",
    ],
    procedureSteps: [
      { title: "Digital Aesthetic Design", desc: "Analyze facial symmetry and design your customized smile preview." },
      { title: "Micro-Preparation & Mockup", desc: "Gentle enamel smoothing and application of aesthetic temporary veneers." },
      { title: "Master Lab Crafting", desc: "Hand-layered porcelain baked to match your ideal shade and translucency." },
      { title: "Precision Bonding", desc: "Permanent bonding with high-strength aesthetic resin cement." },
    ],
    recoveryTime: "1–2 days for gum settling",
    faqs: [
      {
        q: "Do veneers look artificial?",
        a: "No. We utilize multi-layer porcelain with natural translucency and micro-textures that replicate real tooth enamel under any lighting.",
      },
    ],
  },
  {
    id: "dental-implants",
    name: "Single & Full-Arch Dental Implants",
    category: "restorative",
    categoryLabel: "Restorative & Implants",
    shortDescription: "Permanent titanium and zirconia root replacements that look, feel, and function exactly like natural teeth.",
    fullDescription: "The gold standard for tooth replacement. Whether replacing a single missing tooth or rehabilitating an entire arch with All-on-4® or All-on-6®, our surgical specialists use 3D CBCT guided navigation for 99.2% surgical success and lifelong stability.",
    duration: "1–2 surgical sessions",
    priceStartingAt: "$1,250",
    virtualAvailable: true,
    popular: false,
    features: [
      "Guided computer-assisted 3D implant placement",
      "Premium biocompatible titanium or ceramic zirconia implants",
      "Custom screw-retained porcelain crowns",
      "Preserves adjacent teeth without grinding them down",
    ],
    candidateFor: [
      "One or more missing teeth causing chewing difficulty",
      "Loose or uncomfortable removable dentures",
      "Irreparable cracked tooth needing replacement",
      "Adequate or graftable jawbone density",
    ],
    procedureSteps: [
      { title: "3D CBCT Bone Mapping", desc: "High-resolution 3D radiographic mapping of nerves and bone volume." },
      { title: "Gentle Implant Placement", desc: "Precision placement under comfortable local anesthesia or twilight sedation." },
      { title: "Osseointegration Period", desc: "The implant naturally fuses with jawbone over 8–12 weeks." },
      { title: "Permanent Crown Placement", desc: "Custom ceramic crown attached securely to restore full chewing function." },
    ],
    recoveryTime: "2–4 days mild swelling",
    faqs: [
      {
        q: "Is dental implant surgery painful?",
        a: "Most patients report less discomfort than a tooth extraction. We use computer-guided micro-incisions and advanced local anesthesia.",
      },
    ],
  },
  {
    id: "laser-whitening",
    name: "In-Clinic Laser Teeth Whitening",
    category: "cosmetic",
    categoryLabel: "Cosmetic Dentistry",
    shortDescription: "Professional laser-activated whitening brightening your teeth up to 8 shades in a single 60-minute appointment.",
    fullDescription: "Achieve radiant brightness without sensitivity. Our dual-wavelength laser whitening activates specialized medical-grade hydrogen peroxide gel while simultaneously desensitizing enamel with remineralizing ions for zero downtime.",
    duration: "60 mins",
    priceStartingAt: "$199",
    virtualAvailable: false,
    popular: true,
    features: [
      "Up to 8 shades whiter in a single visit",
      "Enamel-safe desensitizing formulation included",
      "Custom take-home touch-up kit with bleaching trays",
      "Targets deep coffee, tea, wine, and tobacco stains",
    ],
    candidateFor: [
      "Teeth yellowed from aging, food, or lifestyle habits",
      "Upcoming weddings, interviews, or public speaking events",
      "Patients who experienced sensitivity with drug-store whitening kits",
    ],
    procedureSteps: [
      { title: "Gingival Barrier Protection", desc: "Gums are carefully shielded with protective resin barrier." },
      { title: "Professional Gel Application", desc: "Application of concentrated 38% medical whitening formula." },
      { title: "Cold Laser Activation", desc: "3 consecutive 15-minute illumination cycles to break down deep pigments." },
      { title: "Fluoride Mineral Shield", desc: "Enamel infused with remineralizing paste for instant sensitivity defense." },
    ],
    recoveryTime: "Immediate (avoid dark staining foods for 48 hrs)",
    faqs: [
      {
        q: "How long does laser whitening last?",
        a: "Typically 12 to 24 months, depending on dietary habits and regular dental hygiene.",
      },
    ],
  },
  {
    id: "hygiene-cleaning",
    name: "Comprehensive Hygiene, Scale & Airflow Polish",
    category: "preventive",
    categoryLabel: "Preventive & Hygiene",
    shortDescription: "Deep ultrasonic scaling, periodontal pocket evaluation, and painless Airflow® sodium bicarbonate stain removal.",
    fullDescription: "Prevent cavities and gum disease before they start. Our dental hygienists use gentle ultrasonic tips combined with Swiss Airflow® technology to remove stubborn calculus (tartar) and extrinsic stains with no scraping or discomfort.",
    duration: "45 mins",
    priceStartingAt: "$85",
    virtualAvailable: false,
    popular: false,
    features: [
      "Painless ultrasonic calculus & biofilm removal",
      "Swiss Airflow® warm-water high gloss stain polishing",
      "Full periodontal gum depth charting (periodontal screening)",
      "High-potency cavity-defense fluoride varnish",
    ],
    candidateFor: [
      "Routine 6-month preventive dental maintenance",
      "Bleeding or swollen gums when brushing",
      "Persistent bad breath (halitosis)",
      "Frequent tea, coffee, or tobacco consumers",
    ],
    procedureSteps: [
      { title: "Periodontal Health Check", desc: "Assessment of gum health and measuring pocket depths." },
      { title: "Ultrasonic Scaling", desc: "Vibrating water micro-jet breaks down hardened tartar calculus." },
      { title: "Airflow Polishing", desc: "Gentle aerosol polish eliminating stubborn tea, coffee, and wine stains." },
      { title: "Enamel Protection", desc: "Fluoride remineralization layer to harden enamel surfaces." },
    ],
    recoveryTime: "Immediate",
    faqs: [
      {
        q: "How often should I get my teeth cleaned?",
        a: "The American Dental Association recommends a professional cleaning every 6 months, or every 3–4 months for patients with active gum disease.",
      },
    ],
  },
  {
    id: "emergency-care",
    name: "Emergency Dental Care & Urgent Pain Relief",
    category: "emergency",
    categoryLabel: "Emergency Care",
    shortDescription: "Same-day appointments and immediate triage for severe toothaches, broken crowns, knocked-out teeth, and acute oral infections.",
    fullDescription: "Dental emergencies cannot wait. We reserve daily priority slots for sudden unbearable pain, acute facial swelling, dental trauma, knocked-out teeth, or fractured restorations. Start with an immediate phone/video triage or walk in directly.",
    duration: "Same-Day / 30–60 mins",
    priceStartingAt: "$95",
    virtualAvailable: true,
    popular: true,
    features: [
      "Same-day guaranteed priority chairside appointments",
      "Rapid diagnostic digital X-rays and pulp vitality testing",
      "Immediate local anesthesia and pain management",
      "Emergency root canal triage, temporary crowns, or extractions",
    ],
    candidateFor: [
      "Intense throbbing pain preventing sleep or eating",
      "Swelling of the jaw, cheek, or gum abscess",
      "Knocked-out (avulsed) or severely displaced tooth",
      "Broken tooth with sharp edges injuring your tongue or cheeks",
    ],
    procedureSteps: [
      { title: "Rapid Triage", desc: "Immediate assessment via video/call or rapid clinical arrival." },
      { title: "Diagnostic Digital Imaging", desc: "Fast low-radiation X-ray locating the exact root infection or fracture." },
      { title: "Instant Pain Neutralization", desc: "Gentle local anesthesia stopping acute nerve pain within minutes." },
      { title: "Stabilization Treatment", desc: "Infection drainage, temporary filling, nerve treatment, or repair." },
    ],
    recoveryTime: "1–3 days depending on procedure",
    faqs: [
      {
        q: "What should I do if a permanent tooth is completely knocked out?",
        a: "Do not touch the root. Rinse gently with milk or saline, place it back into the socket if possible, or store in a container of cold milk and visit us within 60 minutes!",
      },
    ],
  },
  {
    id: "custom-crowns",
    name: "Custom Zirconia Crowns & Ceramic Bridges",
    category: "restorative",
    categoryLabel: "Restorative & Implants",
    shortDescription: "Precision-milled ceramic crowns to reinforce fractured, root-treated, or heavily filled teeth with life-like durability.",
    fullDescription: "Restore damaged or weakened teeth with monolithic zirconia or layered porcelain crowns. Built to withstand natural bite forces while perfectly matching the shade and contours of surrounding teeth.",
    duration: "2 visits",
    priceStartingAt: "$550",
    virtualAvailable: true,
    popular: false,
    features: [
      "Metal-free, 100% biocompatible monolithic zirconia",
      "Digital optical impression (no uncomfortable silicone putty)",
      "Exact anatomical bite alignment preventing jaw stress",
      "Reinforces fragile teeth after root canal therapy",
    ],
    candidateFor: [
      "Tooth with massive decay or broken substantial enamel",
      "Teeth that have undergone root canal treatment",
      "Replacing aged unsightly metal-fused-to-metal crowns",
      "Bridging gaps between missing teeth",
    ],
    procedureSteps: [
      { title: "Conservative Tooth Shaping", desc: "Removing decayed tissue and lightly shaping outer enamel." },
      { title: "Digital 3D Scan", desc: "Optical camera captures microns-level 3D digital impressions." },
      { title: "Aesthetic Temporary Crown", desc: "Wear a protective temporary while your custom crown is CAD/CAM milled." },
      { title: "Bonding & Occlusion Tuning", desc: "High-bond resin cementation and micro-adjustments for perfect bite." },
    ],
    recoveryTime: "Normal chewing resumed after 2 hours",
    faqs: [
      {
        q: "How long do zirconia crowns last?",
        a: "With routine hygiene, zirconia crowns typically last 15 to 20+ years without chipping or staining.",
      },
    ],
  },
  {
    id: "pediatric-care",
    name: "Gentle Pediatric & Teen Dental Care",
    category: "preventive",
    categoryLabel: "Preventive & Hygiene",
    shortDescription: "Anxiety-free, friendly dental checkups, cavity prevention sealants, and early orthodontic guidance for children.",
    fullDescription: "We believe a child's early dental experiences shape a lifetime of positive oral health. Our gentle pediatric specialists provide playful, zero-fear checkups, cavity-fighting molar sealants, fluoride varnishes, and sports mouthguards.",
    duration: "30–45 mins",
    priceStartingAt: "$65",
    virtualAvailable: true,
    popular: false,
    features: [
      "Positive, stress-free 'tell-show-do' child psychology",
      "Cavity-preventing BPA-free dental pit & fissure sealants",
      "Early orthodontic growth monitoring & bite screening",
      "Custom comfortable sports mouthguards",
    ],
    candidateFor: [
      "First dental visit for toddlers (age 1+)",
      "Routine 6-month checkup for school-age children",
      "Preventing tooth decay on deep permanent molars",
      "Teens playing contact sports",
    ],
    procedureSteps: [
      { title: "Fun Clinic Tour & Welcome", desc: "Helping your child feel completely relaxed and curious." },
      { title: "Gentle Examination", desc: "Checking enamel health, tooth alignment, and bite development." },
      { title: "Protective Fissure Sealants", desc: "Painless coating on molar grooves to seal out cavity bacteria." },
      { title: "Child Dental Reward", desc: "Fun oral health kit and brave smile medal!" },
    ],
    recoveryTime: "Immediate",
    faqs: [
      {
        q: "When should my child first see a dentist?",
        a: "The recommendation is by their first birthday or when their first baby tooth emerges.",
      },
    ],
  },
];

const categories = [
  { id: "all", label: "All Treatments" },
  { id: "virtual", label: "Video Consultations" },
  { id: "cosmetic", label: "Cosmetic Dentistry" },
  { id: "orthodontics", label: "Orthodontics & Aligners" },
  { id: "restorative", label: "Restorative & Implants" },
  { id: "preventive", label: "Preventive & Hygiene" },
  { id: "emergency", label: "Emergency Care" },
];

const symptomSuggestions = [
  { symptom: "Severe toothache & throbbing", targetId: "emergency-care", badge: "Urgent" },
  { symptom: "Crooked or crowded smile", targetId: "invisalign-aligners", badge: "Orthodontics" },
  { symptom: "Yellowed or discolored teeth", targetId: "laser-whitening", badge: "Cosmetic" },
  { symptom: "Missing tooth or broken bridge", targetId: "dental-implants", badge: "Restorative" },
  { symptom: "Bleeding gums when flossing", targetId: "hygiene-cleaning", badge: "Preventive" },
  { symptom: "Need second opinion from home", targetId: "virtual-triage", badge: "Virtual Triage" },
];

export default function Services() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);

  // Filter logic
  const filteredServices = useMemo(() => {
    return servicesData.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" ? true : service.category === selectedCategory;

      const matchesVirtual = virtualOnly ? service.virtualAvailable : true;

      return matchesSearch && matchesCategory && matchesVirtual;
    });
  }, [searchQuery, selectedCategory, virtualOnly]);

  const handleSymptomClick = (targetId: string) => {
    const service = servicesData.find((s) => s.id === targetId);
    if (service) {
      setSelectedCategory("all");
      setSearchQuery("");
      setSelectedService(service);
      const el = document.getElementById("services-grid");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-ink selection:bg-mint/30 selection:text-teal-deep">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-teal-deep text-paper pt-14 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Ambient background decoration */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(79, 169, 138, 0.4) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#EFF6F2 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-mint mb-5">
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            <span>Comprehensive Specialized Care • In-Clinic & Telehealth</span>
          </div>

          <h1 className="font-display font-medium text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12] max-w-4xl mx-auto mb-6">
            World-class dentistry designed around your comfort & schedule.
          </h1>

          <p className="text-base sm:text-lg text-[#D2E4DC] max-w-2xl mx-auto leading-relaxed mb-10">
            From online triage and second opinions over secure video to precision smile design and surgical implants, explore clinical care crafted by specialists.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <span className="font-display text-2xl sm:text-3xl font-bold text-white block">15,000+</span>
              <span className="text-xs text-[#A8C4B8] font-medium">Patients Treated</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <span className="font-display text-2xl sm:text-3xl font-bold text-white block">4.9 ★</span>
              <span className="text-xs text-[#A8C4B8] font-medium">Over 2,400 Reviews</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <span className="font-display text-2xl sm:text-3xl font-bold text-white block">15 Mins</span>
              <span className="text-xs text-[#A8C4B8] font-medium">Avg Virtual Triage</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
              <span className="font-display text-2xl sm:text-3xl font-bold text-white block">100%</span>
              <span className="text-xs text-[#A8C4B8] font-medium">Pain-Free Protocols</span>
            </div>
          </div>

          {/* Search & Quick Filter Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center gap-2 border border-line/80">
            <div className="flex items-center gap-3 w-full px-3 py-2 text-ink">
              <Search className="w-5 h-5 text-mint-deep shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by treatment or symptom (e.g., whitening, aligners, toothache)..."
                className="w-full bg-transparent text-sm text-ink placeholder:text-[#A4B5AD] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-ink-soft hover:text-ink text-xs p-1"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 sm:border-l border-line px-3 py-1">
              <button
                type="button"
                onClick={() => setVirtualOnly(!virtualOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  virtualOnly
                    ? "bg-teal-deep text-paper shadow-sm"
                    : "bg-[#EDF6F2] text-teal-deep hover:bg-mint/20"
                }`}
              >
                <Video className="w-3.5 h-3.5 text-mint" />
                <span>Video Consult Only</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Symptom Matcher Quick Suggestion Strip */}
      <section className="bg-[#EDF5F1] border-y border-[#D6E6DE] py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-deep shrink-0 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-mint-deep" />
            <span>Common Dental Symptoms:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {symptomSuggestions.map((item) => (
              <button
                key={item.symptom}
                type="button"
                onClick={() => handleSymptomClick(item.targetId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-line hover:border-mint-deep text-xs font-medium text-ink-soft hover:text-teal-deep hover:shadow-xs transition-all cursor-pointer"
              >
                <span>{item.symptom}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EDF6F2] text-mint-deep font-semibold">
                  {item.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grow w-full">
        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-teal-deep text-white shadow-sm ring-2 ring-teal-deep/15"
                    : "bg-white text-ink-soft border border-line hover:border-teal-deep/30 hover:bg-[#F8FCF9] hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="font-display font-medium text-2xl text-ink">
              {categories.find((c) => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft mt-0.5">
              Showing {filteredServices.length} {filteredServices.length === 1 ? "treatment" : "treatments"}
              {virtualOnly && " available via online video consultation"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {(searchQuery || virtualOnly || selectedCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setVirtualOnly(false);
              }}
              className="text-xs font-semibold text-mint-deep hover:text-teal-deep underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-line max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#EDF6F2] text-mint-deep flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-medium text-ink mb-2">No matching treatments found</h3>
            <p className="text-sm text-ink-soft mb-6">
              We couldn't find any dental treatments matching your search criteria. Try a different keyword or browse all treatments.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setVirtualOnly(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-deep text-white text-sm font-semibold hover:bg-mint-deep transition-colors"
            >
              View All Services
            </button>
          </div>
        ) : (
          <div id="services-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-line hover:border-mint-deep/60 hover:shadow-[0_8px_30px_rgba(16,56,50,0.08)] transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Card top badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-mint-deep bg-[#EDF6F2] px-2.5 py-1 rounded-md">
                      {service.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {service.virtualAvailable && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-deep bg-[#D8EFE5] px-2 py-0.5 rounded-md" title="Online video consultation available">
                          <Video className="w-3 h-3 text-mint-deep" />
                          <span>Video Available</span>
                        </span>
                      )}
                      {service.popular && (
                        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Popular</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="font-display font-medium text-xl text-ink mb-2 group-hover:text-teal-deep transition-colors leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-[13.5px] text-ink-soft leading-relaxed mb-5 line-clamp-3">
                    {service.shortDescription}
                  </p>

                  {/* Metadata pill */}
                  <div className="flex items-center gap-4 py-2.5 px-3.5 rounded-xl bg-[#F8FAF9] border border-line/60 text-xs text-ink-soft mb-5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-mint-deep" />
                      <span>{service.duration}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-line" />
                    <div className="flex items-center gap-1">
                      <span className="text-ink font-semibold">{service.priceStartingAt}</span>
                      <span className="text-[11px] text-ink-soft">starting</span>
                    </div>
                  </div>

                  {/* Highlights list */}
                  <ul className="space-y-2 mb-6">
                    {service.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-ink-soft">
                        <CheckCircle2 className="w-3.5 h-3.5 text-mint-deep shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 border-t border-line/80 bg-[#FAFCFB] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-white hover:border-mint-deep transition-all text-center cursor-pointer"
                  >
                    Clinical Details
                  </button>

                  <Link
                    to="/auth/register"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-teal-deep hover:bg-mint-deep text-paper text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 shadow-xs active:scale-98"
                  >
                    <span>Book Consult</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3-Step Pathway Section */}
        <section className="mt-20 pt-16 border-t border-line">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-mint-deep bg-[#EDF6F2] px-3 py-1 rounded-full">
              Seamless Patient Journey
            </span>
            <h2 className="font-display text-3xl font-medium text-ink mt-3 mb-3">
              Consult with your dentist in 3 simple steps
            </h2>
            <p className="text-sm text-ink-soft">
              Whether meeting over high-definition secure video or walking into our modern clinic, here is how Cedarview delivers predictable dental excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-line shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-teal-deep text-white font-display font-bold text-lg flex items-center justify-center mb-5 shadow-xs">
                1
              </div>
              <h3 className="font-display font-medium text-lg text-ink mb-2">
                Choose Format & Specialist
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                Select between a convenient 15-minute video consultation from home or an in-clinic chairside appointment with your preferred specialist.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-line shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-mint-deep text-white font-display font-bold text-lg flex items-center justify-center mb-5 shadow-xs">
                2
              </div>
              <h3 className="font-display font-medium text-lg text-ink mb-2">
                Digital Examination & 3D Scan
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                Discuss symptoms with your dentist, review radiographic findings, and view 3D outcome simulations of your proposed treatment.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-line shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-teal-mid text-white font-display font-bold text-lg flex items-center justify-center mb-5 shadow-xs">
                3
              </div>
              <h3 className="font-display font-medium text-lg text-ink mb-2">
                Care Plan & Transparent Pricing
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                Receive your comprehensive digital treatment plan directly in your patient account with upfront costs, zero hidden fees, and insurance optimization.
              </p>
            </div>
          </div>
        </section>

        {/* Clinical Guarantees Banner */}
        <section className="mt-16 bg-teal-deep rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #EFF6F2 2px, transparent 2px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-mint text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              The Cedarview Standard
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-medium mb-4">
              Zero surprises. 100% clinical transparency.
            </h2>
            <p className="text-sm sm:text-base text-[#D4E4DC] leading-relaxed mb-8">
              We never perform a procedure without explaining the clinical rationale and providing a written estimate first. With hospital-grade sterilisation, cutting-edge digital radiography, and gentle anaesthetics, your peace of mind is guaranteed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/auth/register"
                className="px-6 py-3 rounded-xl bg-mint text-[#0C2420] text-sm font-semibold hover:bg-[#5EC29F] transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Register & Request Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+918085478598"
                className="px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Call Clinic Reception
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-rise">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-line relative text-ink">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-line flex items-center justify-between z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-mint-deep bg-[#EDF6F2] px-2.5 py-0.5 rounded-md">
                  {selectedService.categoryLabel}
                </span>
                <h3 className="font-display font-medium text-xl text-ink mt-1">
                  {selectedService.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-line-soft transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Quick Info Bar */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F8FAF9] rounded-2xl border border-line/60 text-center">
                <div>
                  <span className="text-xs text-ink-soft block">Starting At</span>
                  <span className="font-display font-semibold text-teal-deep text-lg">
                    {selectedService.priceStartingAt}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft block">Duration</span>
                  <span className="font-display font-semibold text-teal-deep text-lg">
                    {selectedService.duration}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft block">Recovery</span>
                  <span className="font-display font-semibold text-teal-deep text-lg">
                    {selectedService.recoveryTime}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h4 className="font-semibold text-sm text-ink mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-mint-deep" />
                  Clinical Overview
                </h4>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {selectedService.fullDescription}
                </p>
              </div>

              {/* Candidacy */}
              <div>
                <h4 className="font-semibold text-sm text-ink mb-2 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-mint-deep" />
                  Recommended For
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedService.candidateFor.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-ink-soft bg-[#F9FBF9] p-2.5 rounded-xl border border-line/50">
                      <CheckCircle2 className="w-3.5 h-3.5 text-mint-deep shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedure Steps */}
              <div>
                <h4 className="font-semibold text-sm text-ink mb-2.5 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-mint-deep" />
                  Procedure Pathway
                </h4>
                <div className="space-y-2.5">
                  {selectedService.procedureSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-teal-deep text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-ink block">{step.title}</span>
                        <span className="text-ink-soft leading-relaxed">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              {selectedService.faqs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-ink mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-mint-deep" />
                    Frequently Asked Questions
                  </h4>
                  <div className="space-y-2">
                    {selectedService.faqs.map((faq, i) => (
                      <div key={i} className="p-3 bg-[#F8FAF9] rounded-xl border border-line text-xs">
                        <span className="font-semibold text-ink block mb-1">Q: {faq.q}</span>
                        <span className="text-ink-soft leading-relaxed">A: {faq.a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 border-t border-line flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="flex-1 py-3 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-line-soft transition-colors text-center cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/auth/register"
                className="flex-1 py-3 rounded-xl bg-teal-deep hover:bg-mint-deep text-white text-xs font-semibold transition-colors text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Book This Treatment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
