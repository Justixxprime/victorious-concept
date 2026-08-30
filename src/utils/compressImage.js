/**
 * Resizes and re-encodes an image entirely in the browser before it's
 * uploaded — a phone photo that's 12MB and 4000px wide comes out as a
 * compact JPEG capped at maxDimension. Falls back to the original file
 * if anything goes wrong, so a compression failure never blocks an upload.
 */
export async function compressImage(file, maxDimension = 1600, quality = 0.82) {
  if (!file.type.startsWith('image/')) return file

  try {
    const bitmap = await createImageBitmap(file)
    let { width, height } = bitmap

    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file

    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
  } catch {
    return file
  }
}