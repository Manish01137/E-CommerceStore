"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  const validate = () => {
    const next: Record<string, string> = {};
    if (!isLogin && values.name.trim().length < 2) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address";
    if (isLogin) {
      if (!values.password) next.password = "Enter your password";
    } else if (values.password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? { email: values.email, password: values.password }
            : values
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      toast(isLogin ? `Welcome back, ${data.user.name.split(" ")[0]}` : "Account created — welcome!");
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/account");
      router.refresh();
    } catch {
      setServerError("Network error — please try again");
      setSubmitting(false);
    }
  };

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card p-8"
      >
        <p className="eyebrow text-moss-dark">{isLogin ? "Welcome back" : "Join us"}</p>
        <h1 className="mt-2 font-serif text-3xl">
          {isLogin ? "Sign in to your account" : "Create your account"}
        </h1>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={set("name")}
                className={`field ${errors.name ? "field-error" : ""}`}
                placeholder="Asha Sharma"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={set("email")}
              className={`field ${errors.email ? "field-error" : ""}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={values.password}
              onChange={set("password")}
              className={`field ${errors.password ? "field-error" : ""}`}
              placeholder={isLogin ? "Your password" : "Minimum 8 characters"}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          {serverError && (
            <p className="rounded-lg bg-[#8a4a2b]/10 px-4 py-3 text-sm font-semibold text-[#8a4a2b]">
              {serverError}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-earth">
          {isLogin ? (
            <>
              New to Ethereal Artisan?{" "}
              <Link href="/register" className="font-semibold text-moss-deep underline-offset-2 hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-moss-deep underline-offset-2 hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
