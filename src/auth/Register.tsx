import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  User,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const benefits = [
  "Request appointments without calling the clinic",
  "Join consultations by video from your account",
  "See your consultation notes and follow-ups anytime",
];

const roles = [
  { id: "Patient", label: "Patient", icon: User, desc: "Personal care" },
];

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { login, isAuthenticated, user } = useAuth();

  // If already logged in, immediately route to the respective dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (user.role === "superadmin" || (user.role as string) === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  const [userType, setUserType] = useState("Patient");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d+]/g, "");
    setFormData((prev) => ({
      ...prev,
      phone: raw,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Required fields validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      setError("All fields are required.");
      return;
    }

    // Phone number sanitization and validation (10-digit Indian mobile number)
    let cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(2);
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit mobile number starting with 6-9.",
      );
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setError("You must agree to the terms of use and privacy policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/users/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        password: formData.password,
        role: userType.toLowerCase(),
      });

      if (response.data?.token && response.data?.data) {
        login(response.data.token, response.data.data);
      }

      setSuccess(response.data?.message || "Account created successfully!");
      toast.success("Registration successful");

      setTimeout(() => {
        if (redirectPath) {
          navigate(redirectPath);
        } else if (userType.toLowerCase() === "doctor") {
          navigate("/doctor/dashboard");
        } else if (userType.toLowerCase() === "superadmin" || userType.toLowerCase() === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 1200);
    } catch (err: any) {
      const serverError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setError(serverError);
      toast.error(serverError || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left: brand panel */}
        <div className="relative overflow-hidden bg-teal-deep text-[#FAF7F6] px-8 py-12 md:px-14 md:py-14 flex flex-col justify-between min-h-65">
          {/* dot texture */}
          <div
            className="absolute inset-0 opacity-90"
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
            <h1 className="font-display font-medium text-[34px] md:text-[40px] leading-[1.12] tracking-[-0.01em] text-white mb-4">
              One account for booking, records, and your care team.
            </h1>
            <p className="text-[15.5px] leading-relaxed text-[#EBD8D5] mb-7">
              Set up your patient account to request appointments, join video
              consultations, and keep a running history of your visits — all in
              one place.
            </p>

            <ul className="flex flex-col gap-3.5">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-[14.5px] text-[#EBD8D5]"
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-mint" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-[13px] text-[#B3A09D]">
            Your information is encrypted and only shared with your care team.
          </p>

          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="absolute -right-16 -bottom-16 w-95 h-95 opacity-[0.16] z-0"
          >
            <path
              d="M100 20c-30 0-52 18-52 46 0 21 6 35 11 54 4 15 7 36 17 45 4 4 9 2 11-3 4-10 5-28 11-28s7 18 11 28c2 5 7 7 11 3 10-9 13-30 17-45 5-19 11-33 11-54 0-28-22-46-52-46z"
              stroke="#FAF7F6"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Right: form panel */}
        <div className="flex items-center justify-center px-6 py-12 md:px-8">
          <div className="w-full max-w-95">
            <div className="mb-7">
              <h2 className="font-display font-medium text-[27px] mb-2">
                Create your account
              </h2>
              <p className="text-sm text-ink-soft">
                Already registered?{" "}
                <Link
                  to={
                    redirectPath
                      ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
                      : "/auth/login"
                  }
                  className="text-mint-deep font-medium border-b border-transparent hover:border-mint-deep"
                >
                  Log in instead
                </Link>
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                <Field label="First name" htmlFor="firstName">
                  <input
                    id="firstName"
                    type="text"
                    required
                    disabled={loading}
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="input disabled:opacity-60"
                  />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <input
                    id="lastName"
                    type="text"
                    required
                    disabled={loading}
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="input disabled:opacity-60"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="input disabled:opacity-60"
                />
              </Field>

              <Field label="Phone number" htmlFor="phone">
                <input
                  id="phone"
                  type="tel"
                  required
                  disabled={loading}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+91 98765 43210"
                  className="input disabled:opacity-60"
                />
              </Field>
              </div>

              <Field label="I am registering as" htmlFor="userType">
                <div
                  className="grid grid-cols-2 gap-2"
                  role="radiogroup"
                  aria-label="Select user type"
                >
                  {roles.map((role) => {
                    const isSelected = userType === role.id;
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        role="radio"
                        disabled={loading}
                        aria-checked={isSelected}
                        onClick={() => setUserType(role.id)}
                        className={`group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all duration-150 cursor-pointer text-center ${
                          isSelected
                            ? "border-teal-deep bg-[#FAF2F0] text-teal-deep font-semibold shadow-xs ring-2 ring-teal-deep/15"
                            : "border-line bg-white text-ink-soft hover:border-mint-deep/40 hover:bg-[#FAF7F6] hover:text-ink"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                            isSelected
                              ? "bg-teal-deep text-white shadow-xs"
                              : "bg-line-soft text-ink-soft group-hover:text-teal-deep group-hover:bg-[#F2E4E1]"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[13px] leading-tight font-medium">
                          {role.label}
                        </span>
                        <span
                          className={`text-[10.5px] mt-0.5 leading-tight transition-colors ${
                            isSelected
                              ? "text-mint-deep font-normal"
                              : "text-ink-soft/70"
                          }`}
                        >
                          {role.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="hidden"
                  name="userType"
                  id="userType"
                  value={userType}
                />
              </Field>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                <Field label="Password" htmlFor="password">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    className="input pr-10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors p-1 cursor-pointer"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field label="Confirm password" htmlFor="confirmPassword">
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="input pr-10 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors p-1 cursor-pointer"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>
              </div>

              <div className="flex items-start gap-2.5 mt-0.5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  disabled={loading}
                  checked={formData.terms}
                  onChange={handleChange}
                  className="mt-0.75 w-3.75 h-3.75 accent-mint-deep shrink-0 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-[13px] text-ink-soft leading-relaxed cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-ink font-medium hover:underline"
                  >
                    terms of use
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-ink font-medium hover:underline"
                  >
                    privacy policy
                  </Link>
                  , including how my health information is handled.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1.5 rounded-lg bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all text-paper text-[14.5px] font-semibold py-3.5 px-4.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-mint" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create account</span>
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

export default Register;
