// Cloudinary unsigned upload helper
// No SDK needed — direct REST upload from browser

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
const BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

export interface CloudinaryResult {
  url: string      // Full CDN URL
  publicId: string // Cloudinary public ID (for deletion)
  secureUrl: string
}

/**
 * Upload a single image file to Cloudinary using unsigned upload.
 * Returns the CDN URL and public ID.
 */
export async function uploadImage(file: File): Promise<CloudinaryResult | null> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error('Cloudinary not configured — missing CLOUD_NAME or UPLOAD_PRESET')
    return null
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const res = await fetch(BASE_URL, { method: 'POST', body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
      console.error('Cloudinary upload failed:', err)
      return null
    }
    const data = await res.json()
    return {
      url: data.secure_url,
      publicId: data.public_id,
      secureUrl: data.secure_url,
    }
  } catch (e) {
    console.error('Cloudinary upload error:', e)
    return null
  }
}

/**
 * Upload multiple image files to Cloudinary.
 */
export async function uploadImages(files: File[]): Promise<CloudinaryResult[]> {
  const results: CloudinaryResult[] = []
  for (const file of files) {
    const result = await uploadImage(file)
    if (result) results.push(result)
  }
  return results
}

/**
 * Extract a usable thumbnail URL from a Cloudinary URL by adding transformations.
 * e.g. https://res.cloudinary.com/demo/image/upload/v123/abc.jpg
 *   → https://res.cloudinary.com/demo/image/upload/w_400,q_auto/v123/abc.jpg
 */
export function thumbnailUrl(url: string, width = 400): string {
  return url.replace('/upload/', `/upload/w_${width},q_auto/`)
}

/**
 * Extract public ID from a Cloudinary URL.
 */
export function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/)
  return match ? match[1] : null
}
