import { createClient } from "@/lib/supabase/client"

const SIZE = 400

/**
 * Crops the picture to a centred square, scales it to 400 × 400 and re-encodes it as WebP in the browser.
 * Keeps uploads small and drops EXIF data such as the location a photo was taken.
 */
export async function squareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement("canvas")
  canvas.width = SIZE
  canvas.height = SIZE
  canvas
    .getContext("2d")!
    .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read that image"))), "image/webp", 0.85)
  )
}

/** Uploads to avatars/<user id>/avatar.webp (Storage policies only allow a user's own folder). */
export async function uploadAvatar(blob: Blob): Promise<string> {
  const supabase = createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) throw new Error("Sign in again to change your photo")

  const path = `${userId}/avatar.webp`
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { upsert: true, contentType: "image/webp", cacheControl: "31536000" })
  if (error) throw new Error("The upload didn't go through. Try again.")
  const { data } = supabase.storage.from("avatars").getPublicUrl(path)
  // The path never changes, so a version stamp makes browsers and caches fetch the new photo.
  return `${data.publicUrl}?v=${Date.now()}`
}
