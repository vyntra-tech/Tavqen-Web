import { v2 as cloudinary } from 'cloudinary'
import { ENV } from './env.js'

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export function isCloudinaryConfigured(): boolean {
  const secret = ENV.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET
  const key = ENV.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY
  const cloud = ENV.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME

  return Boolean(
    cloud &&
    key &&
    secret &&
    secret !== 'YOUR_CLOUDINARY_API_SECRET' &&
    secret.trim().length > 0
  )
}

export { cloudinary }
export default cloudinary

