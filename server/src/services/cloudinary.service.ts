import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localUploadsDir = path.resolve(__dirname, '../../../public/uploads')

export interface CloudinaryUploadOptions {
  folder?: string
  publicId?: string
  tags?: string[]
  transformation?: any[]
  resourceType?: 'image' | 'raw' | 'video' | 'auto'
}

export interface CloudinaryUploadResult {
  url: string
  secureUrl: string
  publicId: string
  format: string
  width?: number
  height?: number
  bytes: number
  originalFilename?: string
  uploadedAt: string
}

/**
 * Uploads an in-memory file buffer directly to Cloudinary via stream.
 * Automatically falls back to local storage if Cloudinary credentials are not configured.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {},
  originalFilename?: string
): Promise<CloudinaryUploadResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('No image buffer provided for upload.')
  }

  // 1. If Cloudinary credentials are fully active, stream directly to Cloudinary
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        folder: options.folder || 'tavqen/uploads',
        public_id: options.publicId,
        tags: options.tags || ['tavqen', 'website'],
        resource_type: options.resourceType || 'image',
        overwrite: true,
        invalidate: true,
      }

      if (options.transformation) {
        uploadOptions.transformation = options.transformation
      }

      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error('Cloudinary upload_stream error:', error)
            return reject(new Error(error?.message || 'Cloudinary upload failed.'))
          }

          resolve({
            url: result.secure_url || result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            originalFilename: originalFilename || result.original_filename,
            uploadedAt: new Date().toISOString(),
          })
        }
      )

      stream.end(buffer)
    })
  }

  // 2. Local Fallback: when Cloudinary secret is placeholder, save safely to /uploads
  console.warn(
    'Cloudinary API secret not detected in .env. Falling back to local disk storage.'
  )

  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true })
  }

  const cleanName = (originalFilename || 'upload')
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .slice(0, 50)
  const ext = path.extname(cleanName) || '.png'
  const fileName = `${Date.now()}-${cleanName.replace(ext, '')}${ext}`
  const targetPath = path.join(localUploadsDir, fileName)

  fs.writeFileSync(targetPath, buffer)

  return {
    url: `/uploads/${fileName}`,
    secureUrl: `/uploads/${fileName}`,
    publicId: `local/${fileName.replace(ext, '')}`,
    format: ext.replace('.', ''),
    bytes: buffer.length,
    originalFilename,
    uploadedAt: new Date().toISOString(),
  }
}

/**
 * Deletes an image from Cloudinary by its publicId.
 */
export async function deleteFromCloudinary(
  publicId: string
): Promise<{ ok: boolean; result: string }> {
  if (!publicId || typeof publicId !== 'string') {
    return { ok: false, result: 'Invalid or missing public_id.' }
  }

  // Check if it's a local fallback file
  if (publicId.startsWith('local/')) {
    const fileName = publicId.replace('local/', '')
    const localFile = path.join(localUploadsDir, fileName)
    try {
      if (fs.existsSync(localFile)) {
        fs.unlinkSync(localFile)
      }
      return { ok: true, result: 'local_file_deleted' }
    } catch {
      return { ok: true, result: 'local_file_cleanup_skipped' }
    }
  }

  if (!isCloudinaryConfigured()) {
    return { ok: true, result: 'cloudinary_not_configured_noop' }
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    })
    return { ok: res.result === 'ok' || res.result === 'not found', result: res.result }
  } catch (err: any) {
    console.error('Cloudinary destroy error:', err)
    return { ok: false, result: err.message || 'Error deleting asset.' }
  }
}

/**
 * Replaces an existing image: uploads the new image and deletes the old one.
 */
export async function replaceCloudinaryImage(
  oldPublicId: string | undefined | null,
  newBuffer: Buffer,
  options: CloudinaryUploadOptions = {},
  originalFilename?: string
): Promise<CloudinaryUploadResult> {
  const uploadResult = await uploadToCloudinary(newBuffer, options, originalFilename)

  if (oldPublicId && oldPublicId.trim().length > 0) {
    // Delete previous asset asynchronously without blocking the upload response
    deleteFromCloudinary(oldPublicId).catch((err) => {
      console.warn('Failed to delete old Cloudinary image during replacement:', err)
    })
  }

  return uploadResult
}

/**
 * Extracts a Cloudinary public_id from a Cloudinary URL (e.g. https://res.cloudinary.com/.../tavqen/projects/sample.jpg).
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  if (!url.includes('cloudinary.com')) return null

  try {
    const parts = url.split('/')
    const uploadIndex = parts.indexOf('upload')
    if (uploadIndex === -1 || uploadIndex >= parts.length - 1) return null

    // Slice everything after 'upload/v[0-9]+/' or 'upload/'
    let rest = parts.slice(uploadIndex + 1)
    if (rest[0] && /^v\d+$/.test(rest[0])) {
      rest = rest.slice(1)
    }

    const fullPathWithExt = rest.join('/')
    // Remove extension
    const extIndex = fullPathWithExt.lastIndexOf('.')
    if (extIndex !== -1) {
      return fullPathWithExt.slice(0, extIndex)
    }
    return fullPathWithExt
  } catch {
    return null
  }
}

