import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Eye, Stethoscope, User } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const benefits = [
  "Request appointments without calling the clinic",
  "Join consultations by video from your account",
  "See your consultation notes and follow-ups anytime",
];

const roles = [
  { id: "Patient", label: "Patient", icon: User, desc: "Personal care" },
  { id: "Doctor", label: "Doctor", icon: Stethoscope, desc: "Care provider" },
];

function Login() {
  const [userType, setUserType] = useState("Patient");
  return (
    <>
      <Header />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left: brand panel */}
        <div className="relative overflow-hidden bg-teal-deep text-[#EFF6F2] px-8 py-12 md:px-14 md:py-14 flex flex-col justify-between min-h-[260px]">
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

          {/* <div className="relative z-10 flex items-center gap-2.5 font-sans font-semibold text-[15px]">
          <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
            <path
              d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
              stroke="#EFF6F2"
              strokeWidth="1.3"
            />
          </svg>
          Cedarview Dental
        </div> */}

          <div className="relative z-10 max-w-[420px]">
            <h1 className="font-display font-medium text-[34px] md:text-[40px] leading-[1.12] tracking-[-0.01em] text-white mb-4">
              One account for booking, records, and your care team.
            </h1>
            <p className="text-[15.5px] leading-relaxed text-[#C3D8D0] mb-7">
              Set up your patient account to request appointments, join video
              consultations, and keep a running history of your visits — all in
              one place.
            </p>

            <ul className="flex flex-col gap-3.5">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-[14.5px] text-[#DCEAE4]"
                >
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-mint" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-[13px] text-[#85A69B]">
            Your information is encrypted and only shared with your care team.
          </p>

          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="absolute -right-16 -bottom-16 w-[380px] h-[380px] opacity-[0.16] z-0"
          >
            <path
              d="M100 20c-30 0-52 18-52 46 0 21 6 35 11 54 4 15 7 36 17 45 4 4 9 2 11-3 4-10 5-28 11-28s7 18 11 28c2 5 7 7 11 3 10-9 13-30 17-45 5-19 11-33 11-54 0-28-22-46-52-46z"
              stroke="#EFF6F2"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Right: form panel */}
        <div className="flex items-center justify-center px-6 py-12 md:px-8">
          <div className="w-full max-w-[380px]">
            <div className="mb-7">
              <h2 className="font-display font-medium text-[27px] mb-2">
                Login
              </h2>
              <p className="text-sm text-ink-soft">
                Not registered yet?{" "}
                <Link
                  to="/auth/register"
                  className="text-mint-deep font-medium border-b border-transparent hover:border-mint-deep"
                >
                  Register here
                </Link>
              </p>
            </div>

            <form className="flex flex-col gap-4">
              <Field label="Email address" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Email"
                  className="input"
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="Your Password"
                    className="input pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
              </Field>

              <Field label="I am registering as" htmlFor="userType">
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
                        onClick={() => setUserType(role.id)}
                        className={`group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all duration-150 cursor-pointer text-center ${
                          isSelected
                            ? "border-teal-deep bg-[#EDF6F2] text-teal-deep font-semibold shadow-xs ring-2 ring-teal-deep/15"
                            : "border-line bg-white text-ink-soft hover:border-mint-deep/40 hover:bg-[#F9FCFA] hover:text-ink"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                            isSelected
                              ? "bg-teal-deep text-white shadow-xs"
                              : "bg-line-soft text-ink-soft group-hover:text-teal-deep group-hover:bg-[#E2ECE7]"
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

              <div className="flex items-start gap-2.5 mt-0.5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-[3px] w-[15px] h-[15px] accent-mint-deep flex-shrink-0"
                />
                <label
                  htmlFor="terms"
                  className="text-[13px] text-ink-soft leading-relaxed"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-ink font-medium">
                    terms of use
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-ink font-medium">
                    privacy policy
                  </Link>
                  , including how my health information is handled.
                </label>
              </div>

              <button
                type="submit"
                className="mt-1.5 rounded-lg bg-teal-deep hover:bg-mint-deep active:scale-[0.99] transition-colors text-paper text-[14.5px] font-semibold py-3.5 px-4.5"
              >
                Login
              </button>

              {/* <div className="text-[12.5px] text-ink-soft bg-line-soft rounded-lg px-3.5 py-2.5 leading-relaxed">
              Are you a doctor or clinic staff member? Staff accounts are
              created by your administrator —{" "}
              <Link to="/contact-admin" className="text-mint-deep font-medium">
                contact your clinic admin
              </Link>
              .
            </div> */}
            </form>
          </div>
        </div>
      </div>
      <Footer/>
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
