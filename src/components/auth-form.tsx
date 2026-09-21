"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const body = { email: String(form.get("email")), password: String(form.get("password")), ...(mode === "register" ? { name: String(form.get("name")) } : {}) };
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    setPending(false);
    if (!response.ok) { setError(result.error ?? "Something went wrong. Try again."); return; }
    router.push(mode === "register" ? "/onboarding" : "/dashboard");
    router.refresh();
  }
  return <form className="auth-form" onSubmit={submit}>{mode === "register" && <label>Your name<input name="name" required type="text" placeholder="Alex Morgan" /></label>}<label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label><label>Password<input name="password" required minLength={mode === "register" ? 8 : 1} type="password" placeholder={mode === "register" ? "At least 8 characters" : "Your password"} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" disabled={pending} type="submit">{pending ? "Working..." : mode === "register" ? "Create account" : "Log in"} <ArrowRight size={16} /></button></form>;
}
