"use client";

import { ImageOff, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getYouTubeEmbedUrl } from "@/lib/media";

type Media = { type: string; url: string; thumbnailUrl: string | null; title: string | null; source: string | null };

export function ExerciseMedia({ media, exerciseName }: { media: Media[]; exerciseName?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const primary = media.find((item) => item.type === "IMAGE" && item.url) ?? media[0];
  const tutorial = media.find((item) => item.type === "TUTORIAL" && item.url);
  const tutorialEmbed = tutorial ? getYouTubeEmbedUrl(tutorial.url) : null;
  if (!tutorialEmbed && (!primary || imageFailed)) return <div className="exercise-media-fallback"><ImageOff size={38} /><strong>Demo unavailable</strong><span>Follow the written instructions below.</span>{exerciseName && <a className="text-link" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} tutorial proper form`)}`} rel="noreferrer" target="_blank"><Play size={14} /> Find a tutorial</a>}</div>;
  return <div className="exercise-media-stack"><div className="exercise-media-hero">{tutorialEmbed ? <iframe title={tutorial?.title ?? "Exercise demonstration video"} src={tutorialEmbed} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image fill sizes="(max-width: 680px) 100vw, 50vw" src={primary.url} alt={primary.title ?? "Exercise demonstration"} onError={() => setImageFailed(true)} />}<div className="media-credit">{tutorialEmbed ? `Tutorial: ${tutorial?.source ?? "External video"}` : primary.source ? `Image: ${primary.source}` : "Exercise demonstration"}</div></div>{tutorial && <a className="tutorial-link" href={tutorial.url} rel="noreferrer" target="_blank"><span className="tutorial-icon"><Play size={15} fill="currentColor" /></span><span><strong>Open original tutorial</strong><small>{tutorial.title ?? "Watch on YouTube"}</small></span></a>}</div>;
}
