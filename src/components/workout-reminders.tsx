"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, BellRing, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";

const weekdays = [
  { key: "MON", label: "Mon", day: 1 },
  { key: "TUE", label: "Tue", day: 2 },
  { key: "WED", label: "Wed", day: 3 },
  { key: "THU", label: "Thu", day: 4 },
  { key: "FRI", label: "Fri", day: 5 },
  { key: "SAT", label: "Sat", day: 6 },
  { key: "SUN", label: "Sun", day: 0 },
];

function getLocalDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getLocalWeekday(date: Date) {
  return weekdays.find((weekday) => weekday.day === date.getDay())?.key;
}

export function normalizeReminderDays(days: string[] = []) {
  const validDays = new Set(weekdays.map(({ key }) => key));
  const selected = new Set(
    days
      .map((day) => day.trim().toUpperCase())
      .filter((day) => validDays.has(day as (typeof weekdays)[number]["key"])),
  );

  return weekdays.filter(({ key }) => selected.has(key)).map(({ key }) => key);
}

export function getNextReminderDate({
  days,
  time,
  now,
}: {
  days: string[];
  time: string;
  now: Date;
}) {
  const normalizedDays = normalizeReminderDays(days);
  if (normalizedDays.length === 0) return null;

  const [hours, minutes] = time.split(":").map(Number);
  const base = new Date(now);
  base.setSeconds(0, 0);

  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(base);
    candidate.setDate(base.getDate() + offset);
    candidate.setHours(hours, minutes, 0, 0);

    if (normalizedDays.includes(getLocalWeekday(candidate) ?? "") && candidate.getTime() > base.getTime()) {
      return candidate;
    }
  }

  return null;
}

export function formatReminderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function isReminderDue({
  enabled,
  time,
  days,
  now,
}: {
  enabled: boolean;
  time: string;
  days: string[];
  now: Date;
}) {
  if (!enabled) return false;

  const normalizedDays = normalizeReminderDays(days);
  const weekday = getLocalWeekday(now);
  if (!weekday || !normalizedDays.includes(weekday)) return false;

  const [hours, minutes] = time.split(":").map(Number);
  const targetMinutes = hours * 60 + minutes;
  return now.getHours() * 60 + now.getMinutes() >= targetMinutes;
}

function getMinuteSnapshot() {
  return String(Math.floor(Date.now() / 60_000));
}

function subscribeToMinute(onChange: () => void) {
  const timer = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(timer);
}

export function WorkoutReminderSettings({
  initialEnabled,
  initialTime,
  initialDays,
}: {
  initialEnabled: boolean;
  initialTime: string;
  initialDays: string[];
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime);
  const [days, setDays] = useState(() => normalizeReminderDays(initialDays));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const nextReminder = enabled && days.length ? getNextReminderDate({ days, time, now: new Date() }) : null;

  useEffect(() => {
    setEnabled(initialEnabled);
    setTime(initialTime);
    setDays(normalizeReminderDays(initialDays));
  }, [initialDays, initialEnabled, initialTime]);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const normalizedDays = normalizeReminderDays(days);
      const response = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEnabled: enabled, reminderTime: time, reminderDays: normalizedDays }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Could not save reminder settings.");
        return;
      }
      setMessage("Reminder settings saved.");
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      setMessage("This browser does not support notifications.");
      return;
    }
    const permission = Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
    setMessage(permission === "granted"
      ? "Browser notifications are enabled while the dashboard is open."
      : "Browser notifications are blocked. You can still see reminders in the app.");
  }

  return (
    <form className="reminder-settings" onSubmit={saveSettings}>
      <div className="reminder-setting-row">
        <div>
          <h2>Workout reminders</h2>
          <p>Get a nudge when a planned training day is running late.</p>
        </div>
        <label className="reminder-enable">
          <input checked={enabled} onChange={(event) => setEnabled(event.target.checked)} type="checkbox" />
          <span>{enabled ? "On" : "Off"}</span>
        </label>
      </div>

      <fieldset className="reminder-days-field">
        <legend>Training days</legend>
        <div className="reminder-days">
          {weekdays.map(({ key, label }) => (
            <label className="reminder-day" key={key}>
              <input
                checked={days.includes(key)}
                onChange={() => setDays((current) => current.includes(key) ? current.filter((day) => day !== key) : [...current, key])}
                type="checkbox"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="reminder-time-field">
        <span>Remind me after</span>
        <input onChange={(event) => setTime(event.target.value)} required type="time" value={time} />
      </label>

      <div className="reminder-actions">
        <button className="button button-primary" disabled={saving} type="submit">
          <Clock3 size={16} aria-hidden="true" />
          {saving ? "Saving" : "Save reminders"}
        </button>
        <button className="button button-outline" onClick={enableBrowserNotifications} type="button">
          <Bell size={16} aria-hidden="true" /> Enable browser notifications
        </button>
      </div>
      <p className="reminder-note">
        {enabled && nextReminder
          ? `Next reminder: ${formatReminderDate(nextReminder)}`
          : enabled
            ? "Reminder is enabled but no day is selected yet."
            : "Reminder is currently off."}
      </p>
      <p className="reminder-note">In-app reminders appear when you return to FORM. Browser notifications can appear at the chosen time while the dashboard is open and this browser has permission.</p>
      {message && <p className="form-success" role="status">{message}</p>}
    </form>
  );
}

export function WorkoutReminderNotice({
  enabled,
  time,
  days,
  completedAt,
}: {
  enabled: boolean;
  time: string;
  days: string[];
  completedAt: string[];
}) {
  const minute = useSyncExternalStore(subscribeToMinute, getMinuteSnapshot, () => "0");
  const now = new Date(Number(minute) * 60_000);
  const today = getLocalDayKey(now);
  const normalizedDays = normalizeReminderDays(days);
  const due = isReminderDue({ enabled, time, days: normalizedDays, now });
  const alreadyCompleted = completedAt.some((timestamp) => getLocalDayKey(new Date(timestamp)) === today);
  const nextReminder = enabled && normalizedDays.length ? getNextReminderDate({ days: normalizedDays, time, now }) : null;

  useEffect(() => {
    if (!enabled || !due || alreadyCompleted || !normalizedDays.includes(getLocalWeekday(new Date()) ?? "")) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const dateKey = getLocalDayKey(new Date());
    const storageKey = `form-workout-reminder:${dateKey}`;
    if (window.localStorage.getItem(storageKey)) return;

    new Notification("Your workout is still waiting", {
      body: "It is past your planned training time. Start a session when you are ready.",
    });
    window.localStorage.setItem(storageKey, "sent");
  }, [alreadyCompleted, days, due, enabled]);

  if (!enabled || alreadyCompleted) return null;

  if (due) {
    return (
      <aside className="workout-reminder" role="status">
        <span className="workout-reminder-icon"><BellRing size={19} aria-hidden="true" /></span>
        <div>
          <p className="eyebrow">Planned workout</p>
          <h2>Your workout is still waiting.</h2>
          <p>Your reminder was set for {time}. Log a completed session today to keep your plan on track.</p>
        </div>
        <Link className="button button-primary" href="/workouts">Choose a workout</Link>
      </aside>
    );
  }

  if (nextReminder) {
    return (
      <aside className="workout-reminder" role="status">
        <span className="workout-reminder-icon"><BellRing size={19} aria-hidden="true" /></span>
        <div>
          <p className="eyebrow">Upcoming reminder</p>
          <h2>Your next workout reminder is scheduled.</h2>
          <p>Next nudge: {formatReminderDate(nextReminder)}. Keep the plan moving by picking a session before then.</p>
        </div>
        <Link className="button button-primary" href="/settings">Review reminders</Link>
      </aside>
    );
  }

  return null;
}