"use client";

import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";

export function NewExerciseForm() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch("/api/admin/exercises", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, difficulty: "BEGINNER", type: "STRENGTH" }) }); setMessage(response.ok ? "Exercise created." : "Could not create exercise."); if (response.ok) event.currentTarget.reset(); }
  return <form className="admin-form" onSubmit={submit}><p className="eyebrow">Create exercise</p><div className="admin-form-grid"><input name="name" required placeholder="Exercise name" /><input name="primaryMuscle" required placeholder="Primary muscle" /><input name="equipment" required placeholder="Equipment" /><input name="description" required placeholder="Short description" /><textarea name="instructions" required placeholder="Instructions" /></div><button className="button button-primary" type="submit"><Plus size={15} /> Save exercise</button>{message && <span className="form-success" role="status">{message}</span>}</form>;
}

export function NewProgramForm() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch("/api/admin/programs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, duration: Number(data.duration), weeks: Number(data.weeks), daysPerWeek: Number(data.daysPerWeek), difficulty: "BEGINNER", published: false }) }); setMessage(response.ok ? "Program created." : "Could not create program."); if (response.ok) event.currentTarget.reset(); }
  return <form className="admin-form" onSubmit={submit}><p className="eyebrow">Create program</p><div className="admin-form-grid"><input name="name" required placeholder="Program name" /><input name="goal" required placeholder="Goal" /><input name="equipment" required placeholder="Equipment" /><input name="duration" required min="1" type="number" placeholder="Duration (minutes)" /><input name="weeks" required min="1" type="number" placeholder="Weeks" /><input name="daysPerWeek" required min="1" max="7" type="number" placeholder="Days per week" /><textarea name="description" required placeholder="Description" /></div><button className="button button-primary" type="submit"><Plus size={15} /> Save program</button>{message && <span className="form-success" role="status">{message}</span>}</form>;
}
