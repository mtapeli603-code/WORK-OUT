"use client";

import { Check, ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ProfileEditor({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const router = useRouter();
  const [currentName, setCurrentName] = useState(name);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: currentName, avatarUrl: currentAvatarUrl }) });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not update your profile.");
        return;
      }
      setMessage("Profile updated.");
      router.refresh();
    } catch {
      setError("Could not update your profile.");
    } finally {
      setPending(false);
    }
  }

  return <form className="profile-editor" onSubmit={submit}>
    <label>Name<input onChange={(event) => setCurrentName(event.target.value)} required value={currentName} /></label>
    <label>Profile picture URL<input onChange={(event) => setCurrentAvatarUrl(event.target.value)} placeholder="https://example.com/photo.jpg" type="url" value={currentAvatarUrl} /></label>
    <button className="button button-outline" disabled={pending} type="submit"><ImagePlus size={15} /> {pending ? "Saving..." : "Save profile"}</button>
    {message && <span className="form-success" role="status"><Check size={14} /> {message}</span>}
    {error && <span className="form-error" role="alert">{error}</span>}
  </form>;
}