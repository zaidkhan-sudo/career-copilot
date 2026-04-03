"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Rocket, Github, Loader2, Mail, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { LiquidMetalIconBadge } from "@/components/ui/liquid-metal-button";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const router = useRouter();
  const { signInWithGoogle, signInWithGithub } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading("google");
    setMessage(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Google sign-in failed";
      setMessage({ type: "error", text: errorMessage });
      setIsLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading("github");
    setMessage(null);
    try {
      await signInWithGithub();
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "GitHub sign-in failed";
      setMessage({ type: "error", text: errorMessage });
      setIsLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading("email");
    setMessage(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      // Clean up Firebase error messages
      const cleanMessage = errorMessage
        .replace("Firebase: ", "")
        .replace(/\(auth\/.*\)/, "")
        .trim();
      setMessage({ type: "error", text: cleanMessage || "Authentication failed" });
      setIsLoading(null);
    }
  };

  return (
    <>
      {/* Error/Success messages */}
      {(error || message) && (
        <div
          className={`p-4 rounded-xl text-sm ${
            error || message?.type === "error"
              ? "bg-[var(--color-rose-bg)] text-[var(--color-rose)] border border-[var(--color-rose)]/20"
              : "bg-[var(--color-emerald-bg)] text-[var(--color-emerald)] border border-[var(--color-emerald)]/20"
          }`}
        >
          {error === "auth_failed"
            ? "Authentication failed. Please try again."
            : message?.text}
        </div>
      )}

      {/* OAuth buttons */}
      <div className="space-y-3">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-3.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-orange-border)] hover:bg-[var(--color-bg-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </button>

        <button
          onClick={handleGithubLogin}
          disabled={isLoading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-3.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-orange-border)] hover:bg-[var(--color-bg-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading === "github" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Github className="h-5 w-5" />
          )}
          Continue with GitHub
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
          or
        </span>
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
      </div>

      {/* Email/Password form */}
      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="h-12 w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] pl-12 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all focus:border-[var(--color-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]/20"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="h-12 w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-input)] pl-12 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all focus:border-[var(--color-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)]/20"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading !== null || !email || !password}
          className="h-12 w-full rounded-xl btn-primary text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading === "email" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isSignUp ? "Creating account..." : "Signing in..."}
            </>
          ) : isSignUp ? (
            "Create Account"
          ) : (
            "Sign In with Email"
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Create one"}
        </button>
      </form>
    </>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-12 w-full rounded-xl bg-[var(--color-bg-card)]" />
      <div className="h-12 w-full rounded-xl bg-[var(--color-bg-card)]" />
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
        <div className="w-8 h-3 rounded bg-[var(--color-bg-card)]" />
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
      </div>
      <div className="h-12 w-full rounded-xl bg-[var(--color-bg-card)]" />
      <div className="h-12 w-full rounded-xl bg-[var(--color-bg-card)]" />
      <div className="h-12 w-full rounded-xl bg-[var(--color-bg-card)]" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[var(--color-orange)]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[var(--color-amber)]/10 to-transparent rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md space-y-8 px-6"
      >
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Logo */}
        <div className="text-center">
          <motion.div
            className="relative mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute inset-0 mx-auto w-20 h-20 bg-white/20 rounded-2xl blur-2xl opacity-35" />
            <div className="relative mx-auto w-fit">
              <LiquidMetalIconBadge
                icon={<Rocket className="h-9 w-9 transform -rotate-45" />}
                size={80}
              />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-4xl font-extrabold gradient-text-fire font-[family-name:var(--font-display)]"
          >
            CareerPilot
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-[var(--color-text-secondary)]"
          >
            Your AI-powered job-hunting teammate
          </motion.p>
        </div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card glow-orange space-y-5 p-8"
        >
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Sign in to continue your job hunt
            </p>
          </div>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </motion.div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-xs text-[var(--color-text-muted)]"
        >
          By continuing, you agree to CareerPilot&apos;s{" "}
          <a
            href="#"
            className="text-[var(--color-text-primary)] hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-[var(--color-text-primary)] hover:underline"
          >
            Privacy Policy
          </a>
          .
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center text-sm font-medium text-[var(--color-text-secondary)]"
        >
          &ldquo;You sleep.{" "}
          <span className="gradient-text-fire">CareerPilot hunts.</span>
          &rdquo;
        </motion.p>
      </motion.div>
    </div>
  );
}
