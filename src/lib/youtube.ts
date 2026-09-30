/** The video id from a YouTube watch, share or Shorts address, or null for channels and playlists. */
export function youtubeVideoId(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^(www|m)\./, "")
  let id: string | null = null
  if (host === "youtu.be") id = parsed.pathname.slice(1)
  else if (host === "youtube.com") {
    id = parsed.searchParams.get("v") ?? parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null
}

export function youtubeThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
