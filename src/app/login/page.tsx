import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() { return <main className="auth-page"><Link className="brand auth-brand" href="/"><span className="brand-mark">F</span><span>FORM</span></Link><div className="auth-card"><p className="eyebrow">Welcome back</p><h1>Ready when<br />you are.</h1><p className="lede">Log in to pick up where you left off.</p><AuthForm mode="login" /><div className="auth-divider"><span>or</span></div><p className="auth-footer">New to FORM? <Link href="/register">Create an account</Link></p></div><p className="auth-note"><LockKeyhole size={14} /> Your data stays yours.</p></main>; }
