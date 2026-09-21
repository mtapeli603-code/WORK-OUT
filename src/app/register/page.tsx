import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() { return <main className="auth-page"><Link className="brand auth-brand" href="/"><span className="brand-mark">F</span><span>FORM</span></Link><div className="auth-card"><p className="eyebrow">Start here</p><h1>Make your<br />move.</h1><p className="lede">Create your account and build a practice that lasts.</p><AuthForm mode="register" /><p className="auth-footer">Already a member? <Link href="/login">Log in</Link></p></div></main>; }
