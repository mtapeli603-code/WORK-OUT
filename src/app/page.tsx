import { ArrowUpRight, CalendarDays, ChevronRight, Clock3, Flame, Play, Plus, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const upcomingWorkouts = [
  { day: "MON", date: "18", title: "Upper body strength", detail: "Chest · Back · Shoulders", duration: "42 min", color: "coral" },
  { day: "WED", date: "20", title: "Lower body power", detail: "Quads · Glutes · Core", duration: "48 min", color: "blue" },
  { day: "SAT", date: "23", title: "Full body conditioning", detail: "Strength · Cardio", duration: "35 min", color: "yellow" },
];

export function DashboardView() {
  return (
    <AppShell>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">Sunday, September 20, 2026</p>
          <h1>Good morning, Alex<span className="accent-dot">.</span></h1>
          <p className="lede">Small, consistent choices add up. Let&apos;s make today count.</p>
        </div>
        <Link className="button button-primary desktop-action" href="/workouts">
          <Play size={17} fill="currentColor" aria-hidden="true" />
          Start a workout
        </Link>
      </section>

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
          <Link className="button button-light" href="/workouts/upper-body-strength">
            View workout <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <div className="panel-sun" aria-hidden="true" />
        </article>

        <article className="stat-card panel">
          <div className="stat-icon lime"><Flame size={18} fill="currentColor" aria-hidden="true" /></div>
          <p className="eyebrow">Current streak</p>
          <div className="stat-value">12 <span>days</span></div>
          <div className="stat-foot"><TrendingUp size={15} aria-hidden="true" /> 4 days longer than last month</div>
        </article>

        <article className="stat-card panel">
          <div className="stat-icon blue"><CalendarDays size={18} aria-hidden="true" /></div>
          <p className="eyebrow">This week</p>
          <div className="stat-value">3 <span>/ 4 workouts</span></div>
          <div className="week-progress" aria-label="3 of 4 workouts completed"><span /></div>
          <div className="stat-foot">One more session to hit your goal</div>
        </article>
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
            <Link className="workout-row" href="/workouts/upper-body-strength" key={workout.day}>
              <div className={`date-block ${workout.color}`}><span>{workout.day}</span><strong>{workout.date}</strong></div>
              <div className="workout-row-copy"><h3>{workout.title}</h3><p>{workout.detail}</p></div>
              <span className="duration"><Clock3 size={15} aria-hidden="true" /> {workout.duration}</span>
              <ChevronRight className="row-chevron" size={19} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="lower-grid">
        <article className="section-block progress-card">
          <div className="section-heading"><div><p className="eyebrow">Momentum</p><h2>Training consistency</h2></div><Link className="icon-link" href="/progress" aria-label="View progress"><ArrowUpRight size={18} /></Link></div>
          <div className="chart-placeholder" aria-label="Weekly training activity chart">
            <div className="chart-lines"><span /><span /><span /></div>
            <div className="chart-bars"><i style={{ height: "46%" }} /><i style={{ height: "72%" }} /><i style={{ height: "58%" }} /><i className="today" style={{ height: "88%" }} /><i style={{ height: "36%" }} /><i style={{ height: "22%" }} /><i style={{ height: "12%" }} /></div>
          </div>
          <div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        </article>
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
