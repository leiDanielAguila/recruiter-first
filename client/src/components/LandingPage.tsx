import { useState } from "react";
import {
  FileText,
  Briefcase,
  Target,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/services/authStore";
import { AuthApiError } from "@/services/auth";

const features = [
  {
    icon: Target,
    title: "Job Matcher",
    description:
      "AI-powered resume analysis that scores your fit against any job description instantly.",
  },
  {
    icon: FileText,
    title: "Letter Architect",
    description:
      "Generate tailored cover letters in seconds using your job pool data.",
  },
  {
    icon: Briefcase,
    title: "Job Pool",
    description:
      "Track every application — status, dates, and job descriptions — in one place.",
  },
];

// Google logo SVG as a component
function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

type AuthMode = "signin" | "signup";

export function LandingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const signInUser = useAuthStore((state) => state.signInUser);
  const signUpUser = useAuthStore((state) => state.signUpUser);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);

  const passwordPolicyPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const resetFormForModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setFormError("Please include '@' in the email address.");
      return;
    }

    if (!password.trim()) {
      setFormError("Password is required.");
      return;
    }

    if (mode === "signup") {
      if (firstName.trim().length < 2 || lastName.trim().length < 2) {
        setFormError("First and last name must be at least 2 characters long.");
        return;
      }

      if (!passwordPolicyPattern.test(password)) {
        setFormError(
          "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
        );
        return;
      }

      if (!confirmPassword.trim()) {
        setFormError("Please confirm your password.");
        return;
      }

      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
    }

    try {
      if (mode === "signup") {
        await signUpUser({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          confirm_password: confirmPassword,
        });
      } else {
        await signInUser({
          email,
          password,
        });
      }

      navigate("/dashboard/job-pool");
    } catch (error) {
      if (error instanceof AuthApiError) {
        setFormError(error.message);
        return;
      }

      setFormError("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — 80% intro panel (hidden on mobile and tablet) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between px-16 py-14 border-r border-border">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="text-base font-semibold text-foreground">
              Recruiter First
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold text-foreground leading-tight mb-6">
            Land your next job,
            <br />
            smarter and faster.
          </h1>
          <p className="text-lg text-muted-foreground mb-14 leading-relaxed">
            An AI-powered toolkit that matches your resume to roles, crafts
            tailored cover letters, and keeps your entire job search organized
            in one place.
          </p>

          <div className="space-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg border border-border bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {f.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Recruiter First. All rights reserved.
        </p>
      </div>

      {/* Right — auth panel (full width on mobile/tablet, 20% on desktop) */}
      <div className="w-full lg:w-[360px] shrink-0 flex flex-col justify-center px-4 sm:px-8 py-14">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin"
              ? "Sign in to continue to your dashboard."
              : "Start tracking your job search today."}
          </p>
        </div>

        <div className="space-y-4">
          {/* Google sign-in */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-3"
            onClick={() => {
              /* TODO: Google OAuth */
            }}
          >
            <GoogleLogo />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            {mode === "signup" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full gap-2 mt-1"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === "signin"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="text-sm text-center text-muted-foreground">
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-foreground font-medium hover:underline"
              onClick={() =>
                resetFormForModeChange(mode === "signin" ? "signup" : "signin")
              }
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="font-medium text-foreground hover:underline"
            >
              Terms & Conditions
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
