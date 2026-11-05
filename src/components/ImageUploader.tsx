import React, { useState, useRef, useCallback } from 'react'
import {
  UploadCloud,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Trash2,
} from 'lucide-react'
import { mediaApi } from '../services/api'
import { getImageUrl } from '../lib/image'

export interface ImageUploaderProps {
  value?: string
  publicId?: string
  onChange: (url: string, publicId?: string) => void
  onRemove?: () => void
  folder?: string
  label?: string
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto'
  maxSizeMB?: number
  className?: string
  disabled?: boolean
  helpText?: string
  autoDeleteReplaced?: boolean
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = '',
  publicId = '',
  onChange,
  onRemove,
  folder = 'tavqen',
  label,
  aspectRatio = 'auto',
  maxSizeMB = 10,
  className = '',
  disabled = false,
  helpText,
  autoDeleteReplaced = true,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  // Validate selected file before sending to backend
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return `Invalid format (${file.type || 'unknown'}). Allowed: JPG, PNG, WEBP, GIF, SVG.`
    }
    if (file.size > maxSizeBytes) {
      return `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${maxSizeMB}MB.`
    }
    return null
  }

  // Upload file via FormData through backend to Cloudinary
  const handleUploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSuccess(false)
    setUploading(true)
    setProgress(25)

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 15 : prev))
    }, 200)

    try {
      // Store reference to old publicId for cleanup if replacing
      const oldPublicId = publicId

      // Send file to Backend API -> Multer MemoryStorage -> Cloudinary Stream
      const result = await mediaApi.upload(file, folder)
      clearInterval(progressTimer)
      setProgress(100)

      if (result.ok && result.url) {
        setSuccess(true)
        onChange(result.secureUrl || result.url, result.publicId)

        // If replacing existing Cloudinary image and autoDeleteReplaced is enabled
        if (autoDeleteReplaced && oldPublicId && oldPublicId !== result.publicId) {
          mediaApi.delete(oldPublicId).catch((delErr) => {
            console.warn('Could not remove replaced asset from Cloudinary:', delErr)
          })
        }

        setTimeout(() => setSuccess(false), 3000)
      } else {
        throw new Error(result.error || 'Upload failed without an error message.')
      }
    } catch (err: any) {
      clearInterval(progressTimer)
      console.error('Image upload failed:', err)
      const msg = err.response?.data?.error || err.message || 'Image upload failed. Please try again.'
      setError(msg)
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Drag and drop events
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !uploading) {
        setIsDragging(true)
      }
    },
    [disabled, uploading]
  )

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (disabled || uploading) return

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        handleUploadFile(files[0])
      }
    },
    [disabled, uploading]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUploadFile(files[0])
    }
  }

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled || uploading) return

    const currentPublicId = publicId
    if (autoDeleteReplaced && currentPublicId) {
      try {
        await mediaApi.delete(currentPublicId)
      } catch (delErr) {
        console.warn('Failed to delete asset from Cloudinary:', delErr)
      }
    }

    onChange('', '')
    if (onRemove) onRemove()
    setError(null)
  }

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled || uploading) return
    fileInputRef.current?.click()
  }

  // Aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video min-h-[160px]'
      case 'square':
        return 'aspect-square min-h-[140px]'
      case 'portrait':
        return 'aspect-[3/4] min-h-[180px]'
      default:
        return 'min-h-[140px]'
    }
  }

  const displayUrl = value ? getImageUrl(value) : ''

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-slate-300 tracking-wide">
            {label}
          </label>
          {publicId && (
            <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[200px]" title={publicId}>
              ID: {publicId.split('/').pop()}
            </span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Upload & Preview Container */}
      <div
        onClick={() => {
          if (!disabled && !uploading && !displayUrl) {
            fileInputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group rounded-xl border-2 transition-all duration-300 overflow-hidden ${getAspectClass()} ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        } ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-[0_0_25px_rgba(0,217,255,0.25)]'
            : displayUrl
            ? 'border-white/10 bg-[#080D1B]/90 hover:border-cyan-500/40'
            : 'border-dashed border-white/20 bg-[#080D1B]/60 hover:border-cyan-400/50 hover:bg-[#0c1327]/80'
        }`}
      >
        {/* PREVIEW STATE */}
        {displayUrl && (
          <div className="relative w-full h-full min-h-[140px] flex items-center justify-center bg-black/40">
            <img
              src={displayUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-contain max-h-[280px] select-none"
              onError={(e) => {
                // Graceful fallback for broken image
                ;(e.currentTarget as HTMLImageElement).src =
                  'https://via.placeholder.com/400x250/080D1B/00D9FF?text=Preview+Unavailable'
              }}
            />

            {/* Subtle Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReplaceClick}
                  disabled={disabled || uploading}
                  title="Replace Image"
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-black text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-sm transition-transform active:scale-95"
                >
                  <RefreshCw size={13} className={uploading ? 'animate-spin' : ''} />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || uploading}
                  title="Remove Image"
                  className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold flex items-center shadow-md backdrop-blur-sm transition-transform active:scale-95"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="text-[11px] text-slate-300 truncate">
                {displayUrl.startsWith('http') ? 'Cloudinary Hosted' : 'Local Asset'}
              </div>
            </div>
          </div>
        )}

        {/* EMPTY DROPZONE STATE */}
        {!displayUrl && !uploading && (
          <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[140px]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center mb-3 text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,217,255,0.35)] transition-all duration-300">
              <UploadCloud size={24} />
            </div>
            <p className="text-xs font-medium text-slate-200 mb-1">
              <span className="text-cyan-400 font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-[11px] text-slate-400">
              PNG, JPG, WEBP, GIF, SVG (Up to {maxSizeMB}MB)
            </p>
          </div>
        )}

        {/* UPLOADING STATE OVERLAY */}
        {uploading && (
          <div className="absolute inset-0 bg-[#080D1B]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-20">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin mb-3 flex items-center justify-center text-cyan-400">
              <Loader2 size={20} className="animate-spin text-cyan-400" />
            </div>
            <p className="text-xs font-medium text-slate-200 mb-1">
              Uploading to Cloudinary...
            </p>
            <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{progress}%</span>
          </div>
        )}

        {/* SUCCESS BADGE */}
        {success && !uploading && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/90 text-white text-[11px] font-medium shadow-md backdrop-blur-sm animate-fade-in">
            <CheckCircle2 size={13} />
            <span>Uploaded to Cloudinary</span>
          </div>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mt-2 flex items-start gap-2 text-[11px] text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2 animate-fade-in">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload failed</p>
            <p className="text-rose-300/90">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* HELP TEXT */}
      {helpText && !error && (
        <p className="mt-1.5 text-[11px] text-slate-400">
          {helpText}
        </p>
      )}
    </div>
  )
}
export default ImageUploader

