import { ArrowLeft, ArrowUpRight, Check, Clock3, Dumbbell, Play } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const exercises = ["Barbell bench press", "Incline dumbbell press", "Seated cable row", "Dumbbell shoulder press", "Tricep pushdown", "Face pull"];

export default async function WorkoutDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = id.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <AppShell><div className="detail-page"><Link className="back-link" href="/workouts"><ArrowLeft size={16} /> Back to workouts</Link><header className="detail-header"><div><p className="eyebrow">Intermediate · 42 minutes</p><h1>{title}</h1><p className="lede">A balanced push and pull session built around steady, controlled reps.</p></div><Link className="button button-primary" href={`/workout/${id}/start`}><Play size={16} fill="currentColor" /> Start workout</Link></header><div className="detail-meta"><span><Dumbbell size={16} /> 6 exercises</span><span><Clock3 size={16} /> 42 min</span><span><Check size={16} /> Strength focus</span></div><section className="exercise-plan"><div className="section-heading"><div><p className="eyebrow">The session</p><h2>Exercise order</h2></div><span className="filter-chip">6 movements</span></div>{exercises.map((exercise, index) => <Link className="plan-row" href={`/exercises/${exercise.toLowerCase().replaceAll(" ", "-")}`} key={exercise}><span className="plan-number">0{index + 1}</span><div><h3>{exercise}</h3><p>{index === 2 ? "3 sets · 10 reps · 90 sec rest" : "3 sets · 8–12 reps · 90 sec rest"}</p></div><ArrowUpRight size={17} /></Link>)}</section></div></AppShell>;
}
