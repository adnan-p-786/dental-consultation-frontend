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
  ShieldCheck,
  Stethoscope,
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
  { id: "Doctor", label: "Doctor", icon: Stethoscope, desc: "Care provider" },
  { id: "Admin", label: "Admin", icon: ShieldCheck, desc: "Admin" },
  {
    id: "Superadmin",
    label: "Super Admin",
    icon: ShieldCheck,
    desc: "Superadmin",
  },
];

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { login, isAuthenticated, user } = useAuth();

  const [userType, setUserType] = useState<
    "Patient" | "Doctor" | "Admin" | "Superadmin"
  >("Patient");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in, immediately route to the respective dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (
        user.role === "superadmin" ||
        (user.role as string) === "admin"
      ) {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
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

  const handleRoleSelect = (
    roleId: "Patient" | "Doctor" | "Admin" | "Superadmin",
  ) => {
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

      const response = await axios.post("/api/users/login", {
        email: emailClean,
        password: passwordClean,
        role: userType.toLowerCase(),
      });

      if (response.data?.token && response.data?.data) {
        login(response.data.token, response.data.data);
      }

      setSuccess(response.data?.message || "Login successful!");

      const resolvedRole =
        response.data?.data?.role?.toLowerCase() || userType.toLowerCase();

      toast.success("Login successful");

      setTimeout(() => {
        if (redirectPath) {
          navigate(redirectPath);
        } else if (resolvedRole === "superadmin" || resolvedRole === "admin") {
          navigate("/admin/dashboard");
        } else if (resolvedRole === "doctor") {
          navigate("/doctor/dashboard");
        } else {
          navigate("/");
        }
      }, 700);
    } catch (err: any) {
      const serverError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(serverError);
      toast.error(serverError || "Login failed");
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
                Login
              </h2>
              <p className="text-sm text-ink-soft">
                Not registered yet?{" "}
                <Link
                  to={
                    redirectPath
                      ? `/auth/register?redirect=${encodeURIComponent(redirectPath)}`
                      : "/auth/register"
                  }
                  className="text-mint-deep font-medium border-b border-transparent hover:border-mint-deep"
                >
                  Register here
                </Link>
              </p>
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
                <span>{success} Redirecting to your dashboard...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Email address" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="input"
                  disabled={loading}
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Your Password"
                    autoComplete="current-password"
                    className="input pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer p-0.5 transition-colors focus:outline-none"
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

              <Field label="I am logging in as" htmlFor="userType">
                <div
                  className="grid grid-cols-3 gap-2"
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
                        aria-checked={isSelected}
                        disabled={loading}
                        onClick={() =>
                          handleRoleSelect(
                            role.id as
                              | "Patient"
                              | "Doctor"
                              | "Admin"
                              | "Superadmin",
                          )
                        }
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
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.99] transition-all text-paper text-[14.5px] font-semibold py-3.5 px-4.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-paper" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
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

export default Login;
