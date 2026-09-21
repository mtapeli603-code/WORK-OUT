"use client";

import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const goals = ["Build muscle", "Build strength", "Lose weight", "Improve endurance", "General fitness"];
const levels = ["Beginner", "Intermediate", "Advanced"];

export function OnboardingForm() {
  const router = useRouter();
  const [goal, setGoal] = useState("Build strength");
  const [level, setLevel] = useState("Intermediate");
  const [error, setError] = useState("");
  async function submit() {
    const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ primaryGoal: goal, fitnessLevel: level.toUpperCase(), workoutFrequency: 4, preferredDuration: 45, equipment: "Full gym", trainingDays: ["MON", "WED", "THU", "SAT"] }) });
    if (!response.ok) { setError("We could not save those preferences. Try again."); return; }
    router.push("/dashboard");
    router.refresh();
  }
  return <><p className="eyebrow">Step 1 of 4</p><h1>What are you<br />working toward?</h1><p className="lede">Your answer helps us shape a plan that fits your life.</p><div className="choice-grid">{goals.map((item) => <button className={`choice ${goal === item ? "selected" : ""}`} key={item} onClick={() => setGoal(item)} type="button">{item}{goal === item && <Check size={16} />}</button>)}</div><div className="onboarding-level"><p className="eyebrow">Your experience</p><div className="level-row">{levels.map((item) => <button className={`filter-chip ${level === item ? "selected" : ""}`} key={item} onClick={() => setLevel(item)} type="button">{item}</button>)}</div></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" onClick={submit} type="button">Continue <ArrowRight size={16} /></button></>;
}
