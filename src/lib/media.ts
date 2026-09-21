export function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    let videoId = parsed.searchParams.get("v");
    if (parsed.hostname === "youtu.be") videoId = parsed.pathname.slice(1);
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
