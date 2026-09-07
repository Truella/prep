"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth";
import toast from "react-hot-toast";
import { SupabaseError } from "@/lib/types";

export default function AuthForm() {
  const { signUp, signIn } = useAuth();
  const reducedMotion = useReducedMotion();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const entrance = (delay: number) => ({
    initial: { opacity: 0, x: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, x: 0 },
    transition: {
      duration: reducedMotion ? 0 : 0.45,
      delay: reducedMotion ? 0 : delay,
      ease: "easeOut" as const,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await signUp(email, password);
        toast.success("Account created successfully!");
      } else {
        await signIn(email, password);
        toast.success("Logged in successfully!");
      }
    } catch (err: unknown) {
      toast.error((err as SupabaseError)?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <motion.div
        className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl"
        {...entrance(0.05)}
      >
        <svg
          className="h-8 w-8 text-accent"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <motion.div className="text-center" {...entrance(0.14)}>
        <h2
          className="mb-2 text-3xl font-bold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-text-secondary">
          {isSignup ? "Sign up to get started" : "Sign in to continue"}
        </p>
      </motion.div>

      <div className="space-y-4">
        <motion.div {...entrance(0.23)}>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-text-secondary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-text-primary transition focus:outline-none"
          />
        </motion.div>

        <motion.div {...entrance(0.32)}>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-text-secondary"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-text-primary transition focus:outline-none"
          />
        </motion.div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-bg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        {...entrance(0.41)}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Please wait...
          </span>
        ) : (
          <span>{isSignup ? "Create Account" : "Sign In"}</span>
        )}
      </motion.button>

      <motion.div className="relative" {...entrance(0.5)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-bg px-2 text-text-secondary">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
          </span>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => setIsSignup((v) => !v)}
        className="w-full rounded-xl border border-border bg-surface-raised px-6 py-3.5 text-sm font-medium text-text-primary transition-all"
        {...entrance(0.59)}
      >
        {isSignup ? "Sign In Instead" : "Create Account"}
      </motion.button>
    </form>
  );
}
