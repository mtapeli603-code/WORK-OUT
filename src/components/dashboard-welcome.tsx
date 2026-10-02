"use client";

import { useSyncExternalStore } from "react";

function getClientWelcome() {
  const now = new Date();
  const hour = now.getHours();

  const greeting = hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  return `${greeting}|${date}`;
}

export function DashboardWelcome({ name }: { name: string }) {
  const [greeting, date] = useSyncExternalStore(
    () => () => {},
    getClientWelcome,
    () => "Welcome|Today",
  ).split("|");

  return (
    <>
      <p className="eyebrow">{date}</p>
      <h1>{greeting}, {name}<span className="accent-dot">.</span></h1>
    </>
  );
}