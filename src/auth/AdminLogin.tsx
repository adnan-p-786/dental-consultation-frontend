import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLoginMutation } from "@/api/User/userHooks";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "./AuthContext";

type AdminStaffRole = "Doctor" | "Admin" | "Superadmin";

const staffRoles = [
  {
    id: "Doctor" as AdminStaffRole,
    label: "Doctor",
    icon: Stethoscope,
    desc: "Care provider",
    badge: "Medical",
  },
  {
    id: "Admin" as AdminStaffRole,
    label: "Admin",
    icon: ShieldCheck,
    desc: "Clinic manager",
    badge: "Management",
  },
  {
    id: "Superadmin" as AdminStaffRole,
    label: "Super Admin",
    icon: Crown,
    desc: "System admin",
    badge: "Full Access",
  },
];

const portalFeatures = [
  "Doctors: Review upcoming consultations, medical history & write notes",
  "Admins: Manage appointments, doctors, patients and clinic reports",
  "Super Admin: Full system oversight, settings & admin account creation",
];

function AdminLogin() {
  const loginMutation = useLoginMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { login, isAuthenticated, user } = useAuth();

  const [userType, setUserType] = useState<AdminStaffRole>("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in with authorized role, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = (user.role || "").toLowerCase();
      if (userRole === "superadmin" || userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else if (redirectPath && !redirectPath.startsWith("/auth") && !redirectPath.startsWith("/admin/login")) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleRoleSelect = (roleId: AdminStaffRole) => {
    setUserType(roleId);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailClean = formData.email.trim().toLowerCase();
    const passwordClean = formData.password;

    if (!emailClean || !passwordClean) {
      setError("Email address and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginMutation.mutateAsync({
        email: emailClean,
        password: passwordClean,
        role: userType.toLowerCase(),
      });

      if (response.token && response.data) {
        login(response.token, response.data);
      }

      setSuccess(response.message || "Login successful!");

      const resolvedRole =
        response.data?.role?.toLowerCase() || userType.toLowerCase();

      setTimeout(() => {
        if (resolvedRole === "superadmin" || resolvedRole === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (resolvedRole === "doctor") {
          navigate("/doctor/dashboard", { replace: true });
        } else if (redirectPath && !redirectPath.startsWith("/auth") && !redirectPath.startsWith("/admin/login")) {
          navigate(redirectPath, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 300);
    } catch (err: any) {
      const serverError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed. Please verify your credentials and selected role.";
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  const currentRoleConfig = staffRoles.find((r) => r.id === userType);

  return (
    <>
      <Header />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left: brand panel */}
        <div className="relative overflow-hidden bg-teal-deep text-[#FAF7F6] px-8 py-12 md:px-14 md:py-14 flex flex-col justify-between min-h-65">
          {/* dot texture */}
          <div
            className="absolute inset-0 opacity-90 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "linear-gradient(to bottom, transparent, black 40%, black 70%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 40%, black 70%, transparent)",
            }}
          />

          <div className="relative z-10 max-w-105">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-mint text-xs font-semibold uppercase tracking-wider mb-6 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Clinic Staff & Administration</span>
            </div>

            <h1 className="font-display font-medium text-[32px] md:text-[38px] leading-[1.15] tracking-[-0.01em] text-white mb-4">
              Dedicated portal for providers & clinic managers.
            </h1>
            <p className="text-[15px] leading-relaxed text-[#EBD8D5] mb-7">
              Authorized access for Doctors, Clinic Admins, and Super Administrators
              to orchestrate patient appointments, consultations, and staff governance.
            </p>

            <ul className="flex flex-col gap-3.5">
              {portalFeatures.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-3 text-[14px] text-[#EBD8D5]"
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-mint" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Background decorative tooth watermark */}
          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="absolute -right-16 -bottom-16 w-95 h-95 opacity-[0.12] z-0 pointer-events-none"
          >
            <path
              d="M100 20c-30 0-52 18-52 46 0 21 6 35 11 54 4 15 7 36 17 45 4 4 9 2 11-3 4-10 5-28 11-28s7 18 11 28c2 5 7 7 11 3 10-9 13-30 17-45 5-19 11-33 11-54 0-28-22-46-52-46z"
              stroke="#FAF7F6"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Right: form panel */}
        <div className="flex items-center justify-center px-6 py-12 md:px-8 bg-paper">
          <div className="w-full max-w-105">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display font-medium text-[27px] text-ink">
                  Staff & Admin Login
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FAF2F0] text-teal-deep border border-teal-deep/15">
                  {currentRoleConfig?.badge}
                </span>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-[13px] leading-snug">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] leading-snug">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success} Redirecting to your workspace...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Role Selection */}
              <Field label="Sign in as" htmlFor="staffRole">
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Select staff role"
                >
                  {staffRoles.map((role) => {
                    const isSelected = userType === role.id;
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={loading}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`group relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-150 cursor-pointer text-center ${
                          isSelected
                            ? "border-teal-deep bg-[#FAF2F0] text-teal-deep font-semibold shadow-xs ring-2 ring-teal-deep/15"
                            : "border-line bg-white text-ink-soft hover:border-mint-deep/40 hover:bg-[#FAF7F6] hover:text-ink"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                            isSelected
                              ? "bg-teal-deep text-white shadow-xs"
                              : "bg-line-soft text-ink-soft group-hover:text-teal-deep group-hover:bg-[#F2E4E1]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] leading-tight font-medium">
                          {role.label}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 leading-tight transition-colors ${
                            isSelected
                              ? "text-mint-deep font-semibold"
                              : "text-ink-soft/70"
                          }`}
                        >
                          {role.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Email */}
              <Field label="Clinic Email Address" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    userType === "Doctor"
                      ? "doctor@dentalcare.com"
                      : "admin@dentalcare.com"
                  }
                  autoComplete="email"
                  className="input placeholder:text-xs"
                  disabled={loading}
                />
              </Field>

              {/* Password */}
              <Field label="Password" htmlFor="password">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="input pr-10 placeholder:text-xs"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer p-0.5 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between text-[13px] mt-1">
                <label
                  htmlFor="rememberMe"
                  className="flex items-center gap-2 cursor-pointer select-none text-ink-soft hover:text-ink"
                >
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-line text-teal-deep accent-mint-deep focus:ring-mint-deep/20 cursor-pointer"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.99] transition-all text-paper text-[14.5px] font-semibold py-3.5 px-4.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-paper" />
                    <span>Signing In..</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

export default AdminLogin;
