import multer from 'multer'
import type { Request, Response, NextFunction } from 'express'

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

// 10MB default size limit
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Multer memory storage keeps file buffer in memory for direct stream upload to Cloudinary
const storage = multer.memoryStorage()

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const mime = file.mimetype.toLowerCase()
  if (ALLOWED_MIME_TYPES.has(mime)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `Invalid file format (${file.mimetype}). Only JPG, PNG, WEBP, GIF, and SVG images are allowed.`
      )
    )
  }
}

export const multerUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter,
})

// Flexible single image upload middleware that supports 'file' or 'image' field,
// and gracefully passes JSON payloads through without throwing.
export function uploadSingle(defaultField: string = 'file') {
  const uploadFields = multerUpload.fields([
    { name: defaultField, maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ])

  return (req: Request, res: Response, next: NextFunction) => {
    // If not a multipart/form-data request, skip multer processing (e.g., base64 JSON payload)
    const contentType = req.headers['content-type'] || ''
    if (!contentType.includes('multipart/form-data')) {
      return next()
    }

    uploadFields(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            ok: false,
            error: `File size exceeds the allowed limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          })
        }
        return res.status(400).json({ ok: false, error: err.message })
      } else if (err) {
        return res.status(400).json({ ok: false, error: err.message || 'File upload failed' })
      }

      // Populate req.file with whichever field was provided
      if (req.files && typeof req.files === 'object') {
        const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] }
        const matched = filesMap[defaultField]?.[0] || filesMap['file']?.[0] || filesMap['image']?.[0]
        if (matched) {
          req.file = matched
        }
      }

      next()
    })
  }
}

// Multiple images upload middleware wrapper
export function uploadMultiple(fieldName: string = 'images', maxCount: number = 5) {
  const upload = multerUpload.array(fieldName, maxCount)

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            ok: false,
            error: `One or more files exceed the allowed limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          })
        }
        return res.status(400).json({ ok: false, error: err.message })
      } else if (err) {
        return res.status(400).json({ ok: false, error: err.message || 'File upload failed' })
      }
      next()
    })
  }
}
