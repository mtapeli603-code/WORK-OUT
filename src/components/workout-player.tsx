"use client";

import { ArrowLeft, Check, ChevronRight, Clock3, Pause, Play, SkipForward } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExerciseMedia } from "@/components/exercise-media";

type ExerciseMediaItem = { type: string; url: string; thumbnailUrl: string | null; title: string | null; source: string | null };
type Session = { id: string; workout: { name: string }; exercises: { id: string; exercise: { name: string; instructions: string; media: ExerciseMediaItem[] }; sets: { setNumber: number; weight: number | null; reps: number | null }[] }[] };

export function WorkoutPlayer({ workoutSlug }: { workoutSlug: string }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rest, setRest] = useState(90);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storageKey = `form-active-session:${workoutSlug}`;
    const restore = (result: { session: Session }) => {
      const savedExercise = window.localStorage.getItem(`${storageKey}:exercise`);
      if (savedExercise) setExerciseIndex(Math.min(Number(savedExercise), result.session.exercises.length - 1));
      setSession(result.session);
    };
    const load = async () => {
      const savedId = window.localStorage.getItem(storageKey);
      if (savedId) {
        const restored = await fetch(`/api/workout-sessions/${savedId}`);
        if (restored.ok) {
          const result = await restored.json();
          if (!result.session.completedAt) { restore(result); return; }
        }
        window.localStorage.removeItem(storageKey);
      }
      const response = await fetch("/api/workout-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workoutSlug }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Could not start workout."); return; }
      window.localStorage.setItem(storageKey, result.session.id);
      restore(result);
    };
    load().catch(() => setError("Could not start workout."));
  }, [workoutSlug]);

  useEffect(() => { window.localStorage.setItem(`form-active-session:${workoutSlug}:exercise`, String(exerciseIndex)); }, [exerciseIndex, workoutSlug]);
  useEffect(() => { if (!rest) return; const timer = window.setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [rest]);

  const exercise = session?.exercises[exerciseIndex];
  const totalSets = exercise?.sets.length || 3;
  const completedSets = exercise?.sets.filter((set) => set.reps !== null).length || 0;
  const formattedRest = useMemo(() => `${String(Math.floor(rest / 60)).padStart(2, "0")}:${String(rest % 60).padStart(2, "0")}`, [rest]);

  async function completeSet() {
    if (!session || !exercise || saving) return;
    setSaving(true);
    const response = await fetch(`/api/workout-sessions/${session.id}/sets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completedExerciseId: exercise.id, setNumber: completedSets + 1, weight: weight ? Number(weight) : undefined, reps: reps ? Number(reps) : undefined, restSeconds: 90 }) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setError(result.error ?? "Could not save set."); return; }
    setSession((current) => current ? { ...current, exercises: current.exercises.map((item, index) => index === exerciseIndex ? { ...item, sets: [...item.sets, result.set] } : item) } : current);
    setWeight(""); setReps(""); setRest(90);
  }

  async function finishWorkout() {
    if (!session) return;
    const response = await fetch(`/api/workout-sessions/${session.id}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ durationSeconds: 42 * 60 }) });
    if (!response.ok) { setError("Could not finish workout."); return; }
    window.localStorage.removeItem(`form-active-session:${workoutSlug}`);
    window.localStorage.removeItem(`form-active-session:${workoutSlug}:exercise`);
    router.push(`/workout/${workoutSlug}/complete?session=${session.id}`);
    router.refresh();
  }

  if (error) return <main className="player-page"><div className="player-error"><p className="eyebrow">Workout unavailable</p><h1>{error}</h1><Link className="button button-primary" href="/workouts">Back to workouts</Link></div></main>;
  if (!session || !exercise) return <main className="player-page"><div className="player-loading"><span className="loading-dot" /> Preparing your session...</div></main>;

  return <main className="player-page">
    <header className="player-topbar"><Link href={`/workouts/${workoutSlug}`} className="icon-button" aria-label="Exit workout"><ArrowLeft size={20} /></Link><span className="player-title">{session.workout.name}</span><span className="player-count">{String(exerciseIndex + 1).padStart(2, "0")} / {String(session.exercises.length).padStart(2, "0")}</span></header>
    <div className="player-progress"><span style={{ width: `${((exerciseIndex + 1) / session.exercises.length) * 100}%` }} /></div>
    <section className="player-content">
      <p className="eyebrow">Current exercise</p>
      <ExerciseMedia exerciseName={exercise.exercise.name} media={exercise.exercise.media} />
      <h1>{exercise.exercise.name}</h1>
      <p className="player-copy">{exercise.exercise.instructions}</p>
      <div className="previous-performance"><span>Previous performance</span><strong>Track your first session</strong><ChevronRight size={16} /></div>
      <div className="set-list">{Array.from({ length: totalSets }, (_, index) => <div className={`set-row ${index === completedSets ? "current" : ""}`} key={index}><span className="set-number">Set {index + 1}</span>{index === completedSets ? <><input aria-label="Weight" inputMode="decimal" onChange={(event) => setWeight(event.target.value)} placeholder="kg" type="number" value={weight} /><span>×</span><input aria-label="Reps" inputMode="numeric" onChange={(event) => setReps(event.target.value)} placeholder="reps" type="number" value={reps} /><button className="set-complete" disabled={!reps || saving} onClick={completeSet} type="button"><Check size={16} /></button></> : index < completedSets ? <span className="set-done"><Check size={15} /></span> : <span className="set-pending" />}</div>)}</div>
      <div className="rest-control"><div><Clock3 size={17} /><span>Rest timer</span></div><strong>{formattedRest}</strong><button className="icon-button" onClick={() => setRest(rest ? 0 : 90)} type="button" aria-label={rest ? "Skip rest timer" : "Start rest timer"}>{rest ? <Pause size={17} /> : <Play size={17} />}</button></div>
      <div className="player-actions"><button className="button button-outline" onClick={() => setRest(0)} type="button"><SkipForward size={16} /> Skip rest</button>{exerciseIndex < session.exercises.length - 1 ? <button className="button button-primary" onClick={() => { setExerciseIndex((index) => index + 1); setRest(90); }} type="button">Next exercise <ChevronRight size={15} /></button> : <button className="button button-primary" onClick={finishWorkout} type="button">Finish workout <Check size={15} /></button>}</div>
    </section>
  </main>;
}
