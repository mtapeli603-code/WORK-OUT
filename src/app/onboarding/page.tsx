import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding-form";

export default function OnboardingPage() { return <main className="onboarding-page"><Link className="brand" href="/"><span className="brand-mark">F</span><span>FORM</span></Link><div className="onboarding-card"><div className="step-count"><span className="step-active" /><span /><span /><span /></div><OnboardingForm /></div></main>; }
