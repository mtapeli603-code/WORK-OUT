import { ArrowLeft, ArrowRight, Check, Dumbbell, Trophy } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function WorkoutCompletePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ session?: string }> }) {
  const { id } = await params;
  const { session: sessionId } = await searchParams;
  const user = await getCurrentUser();
  const session = user && sessionId ? await prisma.workoutSession.findFirst({ where: { id: sessionId, userId: user.id }, include: { workout: true, exercises: { include: { sets: true } } } }) : null;
  const sets = session?.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0) ?? 0;
  const volume = session?.exercises.reduce((sum, exercise) => sum + exercise.sets.reduce((setSum, set) => setSum + (set.weight ?? 0) * (set.reps ?? 0), 0), 0) ?? 0;
  return <AppShell><div className="completion-page"><Link className="back-link" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</Link><div className="completion-mark"><Check size={32} /></div><p className="eyebrow">Session complete</p><h1>That&apos;s the work<span className="accent-dot">.</span></h1><p className="lede">You showed up and followed through. Keep the rhythm going.</p><div className="completion-stats"><div><strong>{session?.durationSeconds ? Math.round(session.durationSeconds / 60) : "—"}</strong><span>minutes</span></div><div><strong>{session?.exercises.length ?? "—"}</strong><span>exercises</span></div><div><strong>{sets || "—"}</strong><span>sets</span></div><div><strong>{volume ? Math.round(volume).toLocaleString() : "—"}</strong><span>kg volume</span></div></div><div className="completion-actions"><Link className="button button-primary" href={`/workouts/${session?.workout.slug ?? id}`}><Dumbbell size={16} /> View workout</Link><Link className="button button-outline" href="/progress"><Trophy size={16} /> View progress</Link><Link className="text-link" href="/dashboard">Back to dashboard <ArrowRight size={15} /></Link></div></div></AppShell>;
}
