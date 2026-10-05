"use client";

import { useSyncExternalStore } from "react";
import { CalendarDays, Flame } from "lucide-react";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subscribeToLocalDay(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

function getLocalDay() {
  return localDateKey(new Date());
}

function useLocalDay() {
  return useSyncExternalStore(subscribeToLocalDay, getLocalDay, () => "2000-01-03");
}

function getConsistency(completedAt: string[], todayKey: string) {
  const sessionsByDay = new Map<string, number>();
  for (const timestamp of completedAt) {
    const day = localDateKey(new Date(timestamp));
    sessionsByDay.set(day, (sessionsByDay.get(day) ?? 0) + 1);
  }

  const today = new Date(`${todayKey}T12:00:00`);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      key: localDateKey(date),
      label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
      count: sessionsByDay.get(localDateKey(date)) ?? 0,
    };
  });

  let streak = 0;
  const streakStart = (sessionsByDay.get(todayKey) ?? 0) > 0
    ? today
    : new Date(today);
  if ((sessionsByDay.get(todayKey) ?? 0) === 0) streakStart.setDate(streakStart.getDate() - 1);
  const cursor = new Date(streakStart);
  while (sessionsByDay.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    weekDays,
    streak,
    thisWeek: weekDays.reduce((total, day) => total + day.count, 0),
  };
}

export function DashboardConsistencyStats({ completedAt, weeklyGoal }: { completedAt: string[]; weeklyGoal: number | null }) {
  const todayKey = useLocalDay();
  const consistency = getConsistency(completedAt, todayKey);

  return (
    <>
      <article className="stat-card panel">
        <div className="stat-icon lime"><Flame size={18} fill="currentColor" aria-hidden="true" /></div>
        <p className="eyebrow">Current streak</p>
        <div className="stat-value">{consistency.streak} <span>{consistency.streak === 1 ? "day" : "days"}</span></div>
        <div className="stat-foot">Consecutive days with a completed workout</div>
      </article>

      <article className="stat-card panel">
        <div className="stat-icon blue"><CalendarDays size={18} aria-hidden="true" /></div>
        <p className="eyebrow">This week</p>
        <div className="stat-value">
          {consistency.thisWeek}
          <span>{weeklyGoal ? ` / ${weeklyGoal} workouts` : consistency.thisWeek === 1 ? " workout" : " workouts"}</span>
        </div>
        {weeklyGoal !== null && <div className="week-progress" aria-label={`${consistency.thisWeek} of ${weeklyGoal} weekly workouts completed`}><span style={{ width: `${Math.min(100, consistency.thisWeek / weeklyGoal * 100)}%` }} /></div>}
        <div className="stat-foot">{weeklyGoal ? "Completed workouts this Monday through Sunday" : "Completed workouts this Monday through Sunday"}</div>
      </article>
    </>
  );
}

export function DashboardConsistencyChart({ completedAt }: { completedAt: string[] }) {
  const todayKey = useLocalDay();
  const consistency = getConsistency(completedAt, todayKey);
  const maxCount = Math.max(1, ...consistency.weekDays.map((day) => day.count));

  return (
    <article className="section-block progress-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Momentum</p>
          <h2>Training consistency</h2>
        </div>
        <span className="filter-chip selected">{consistency.thisWeek} this week</span>
      </div>
      <div className="chart-placeholder" role="img" aria-label={`Completed workout sessions by day this week: ${consistency.weekDays.map((day) => `${day.label} ${day.count}`).join(", ")}`}>
        <div className="chart-lines"><span /><span /><span /></div>
        <div className="chart-bars">
          {consistency.weekDays.map((day) => (
            <i
              className={day.key === todayKey ? "today" : ""}
              key={day.key}
              style={{ height: `${day.count ? Math.max(8, day.count / maxCount * 100) : 2}%` }}
            />
          ))}
        </div>
      </div>
      <div className="chart-labels">{consistency.weekDays.map((day) => <span key={day.key}>{day.label}</span>)}</div>
    </article>
  );
}