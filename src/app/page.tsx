import { ArrowUpRight, ChevronRight, Clock3, Play, Plus, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DashboardConsistencyChart, DashboardConsistencyStats } from "@/components/dashboard-consistency";
import { DashboardWelcome } from "@/components/dashboard-welcome";
import { DashboardWorkoutReminder } from "@/components/dashboard-workout-reminder";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const upcomingWorkouts = [
  { day: "MON", date: "18", title: "Upper body strength", detail: "Chest · Back · Shoulders", duration: "42 min", color: "coral" },
  { day: "WED", date: "20", title: "Lower body power", detail: "Quads · Glutes · Core", duration: "48 min", color: "blue" },
  { day: "SAT", date: "23", title: "Full body conditioning", detail: "Strength · Cardio", duration: "35 min", color: "yellow" },
];

export async function DashboardView() {
  const user = await getCurrentUser();
  const name = user?.name?.trim() || "there";
  const completedSessions = user ? await prisma.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    select: { completedAt: true },
  }) : [];
  const completedAt = completedSessions.flatMap((session) => session.completedAt ? [session.completedAt.toISOString()] : []);
  const weeklyGoal = user?.profile?.workoutFrequency ?? null;

  return (
    <AppShell>
      <section className="welcome-row">
        <div>
          <DashboardWelcome name={name} />
          <p className="lede">Small, consistent choices add up. Let&apos;s make today count.</p>
        </div>
        <Link className="button button-primary desktop-action" href="/workouts">
          <Play size={17} fill="currentColor" aria-hidden="true" />
          Start a workout
        </Link>
      </section>

      <DashboardWorkoutReminder />

      <section className="dashboard-grid" aria-label="Training overview">
        <article className="next-workout panel panel-dark">
          <div className="panel-heading">
            <div>
              <p className="eyebrow light">Up next</p>
              <h2>Upper body strength</h2>
            </div>
            <span className="status-pill">Today</span>
          </div>
          <p className="panel-copy">A balanced push and pull session built around steady, controlled reps.</p>
          <div className="workout-meta">
            <span><Clock3 size={16} aria-hidden="true" /> 42 min</span>
            <span><DumbbellIcon /> 6 exercises</span>
          </div>
          <Link className="button button-light" href="/workouts/strength-foundations-upper">
            View workout <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <div className="panel-sun" aria-hidden="true" />
        </article>

        <DashboardConsistencyStats completedAt={completedAt} weeklyGoal={weeklyGoal} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your plan</p>
            <h2>Coming up this week</h2>
          </div>
          <Link className="text-link" href="/workouts">View schedule <ChevronRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="workout-list">
          {upcomingWorkouts.map((workout) => (
            <Link className="workout-row" href="/workouts/strength-foundations-upper" key={workout.day}>
              <div className={`date-block ${workout.color}`}><span>{workout.day}</span><strong>{workout.date}</strong></div>
              <div className="workout-row-copy"><h3>{workout.title}</h3><p>{workout.detail}</p></div>
              <span className="duration"><Clock3 size={15} aria-hidden="true" /> {workout.duration}</span>
              <ChevronRight className="row-chevron" size={19} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="lower-grid">
        <DashboardConsistencyChart completedAt={completedAt} />
        <article className="section-block quick-search">
          <div className="section-heading"><div><p className="eyebrow">Explore</p><h2>Find an exercise</h2></div><span className="search-orb" aria-hidden="true"><Plus size={18} /></span></div>
          <p>Browse the library by muscle group, equipment, or movement.</p>
          <Link className="button button-outline" href="/exercises"><Search size={17} aria-hidden="true" /> Explore exercises <ArrowUpRight size={17} aria-hidden="true" /></Link>
          <div className="muscle-tags"><span>Chest</span><span>Back</span><span>Legs</span><span>Core</span></div>
        </article>
      </section>
    </AppShell>
  );
}

function DumbbellIcon() { return <span className="mini-icon" aria-hidden="true">✦</span>; }

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link className="brand" href="/"><span className="brand-mark">F</span><span>FORM</span></Link>
        <div className="landing-actions"><Link className="text-link" href="/login">Log in</Link><Link className="button button-primary" href="/register">Get started <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </nav>
      <section className="landing-hero">
        <div className="landing-copy"><p className="eyebrow">Training, with intention</p><h1>Build strength<br /><em>that lasts.</em></h1><p className="lede">A calmer, smarter way to train. Follow a plan, track every rep, and see what consistent effort can do.</p><div className="landing-actions"><Link className="button button-primary" href="/register">Start your journey <ArrowUpRight size={17} aria-hidden="true" /></Link><Link className="text-link" href="/login">Already a member? Log in</Link></div></div>
        <div className="hero-visual" aria-label="Abstract training progress illustration"><div className="hero-ring ring-one" /><div className="hero-ring ring-two" /><div className="hero-card"><p className="eyebrow">Today&apos;s focus</p><strong>Upper body<br />strength</strong><div className="hero-card-foot"><span>06 exercises</span><span>42 min</span></div></div><div className="hero-note"><TrendingUp size={15} aria-hidden="true" /> 12 day streak</div></div>
      </section>
      <section className="landing-proof"><span>Structured programs</span><span>Progress you can feel</span><span>Made for real life</span></section>
    </main>
  );
}
