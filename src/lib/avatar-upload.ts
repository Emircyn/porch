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
