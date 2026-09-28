/**
 * File storage service — local in demo mode, shaped for Supabase Storage.
 * ---------------------------------------------------------------------------
 * In demo mode files are validated and held in memory only; nothing is sent
 * anywhere, and only metadata is persisted with the order.
 *
 * TO CONNECT SUPABASE STORAGE:
 *   1. npm i @supabase/supabase-js
 *   2. create a bucket, e.g. `order-files` (keep it PRIVATE)
 *   3. replace `upload` with:
 *        const { data, error } = await supabase.storage
 *          .from('order-files')
 *          .upload(`${userId}/${crypto.randomUUID()}-${file.name}`, file, {
 *            upsert: false,
 * contentType: file.type,
 *          })
 *      and return { path: data.path, signedUrl: null }
 *   4. serve downloads through `createSignedUrl(path, 60)` so the bucket can
 *      stay private.
 */

import { siteConfig } from '../config/siteConfig'
import { fileExtension } from '../lib/utils'

const BUCKET = 'order-files'

/**
 * Bucket tags are kept in a WeakMap rather than written onto the `File`.
 * `File` instances are host objects: spreading them drops their prototype
 * getters, and assigning properties to them is fragile. A WeakMap keeps the
 * tag out of the object entirely and is garbage-collected with the file.
 */
const bucketTags = new WeakMap()

const allowed = siteConfig.upload.extensions

export const validateFile = (file) => {
  const ext = fileExtension(file.name)
  if (!allowed.includes(ext)) {
    return { ok: false, error: `.${ext || 'unknown'} files aren't supported.` }
  }
  if (file.size > siteConfig.upload.maxSizeMb * 1024 * 1024) {
    return { ok: false, error: `Max ${siteConfig.upload.maxSizeMb} MB per file.` }
  }
  return { ok: true, error: null }
}

export const storageService = {
  isDemo: true,
  bucket: BUCKET,

  /**
   * Validates a batch of files.
   * Returns `{ files, errors }` — valid files are kept even if some are
   * rejected, so the student can fix just the problems.
   *
   * `bucketKey` distinguishes requirement uploads from inspiration/reference
   * uploads so they are stored in separate prefixes server-side.
   *
   * NOTE: `File` properties (`name`, `size`, `type`) live on the prototype as
   * getters, so `{ ...file }` yields an empty object. Real `File` objects are
   * therefore passed through untouched and converted to plain metadata objects
   * only once, after upload.
   */
  pickFiles(fileList, existing = [], bucketKey = 'requirements') {
    const incoming = Array.from(fileList || [])
    const errors = []
    const accepted = []

    const room = siteConfig.upload.maxFiles - existing.length
    if (room <= 0) {
      return {
        files: existing,
        errors: [`You can upload up to ${siteConfig.upload.maxFiles} files.`],
      }
    }

    for (const file of incoming) {
      if (existing.some((f) => f.name === file.name) || accepted.some((f) => f.name === file.name)) {
        errors.push(`${file.name} is already added.`)
        continue
      }
      const { ok, error } = validateFile(file)
      if (!ok) {
        errors.push(error)
        continue
      }
      // Keep the real File; tag the bucket in a WeakMap to keep its getters.
      bucketTags.set(file, bucketKey)
      accepted.push(file)
      if (existing.length + accepted.length >= siteConfig.upload.maxFiles) {
        if (incoming.length > accepted.length) {
          errors.push(`Only ${siteConfig.upload.maxFiles} files can be uploaded.`)
        }
        break
      }
    }

    return { files: [...existing, ...accepted], errors }
  },

  /** Which prefix a picked file belongs in. */
  getBucketKey(file) {
    return (file && bucketTags.get(file)) || 'requirements'
  },

  /** Demo upload: resolves instantly with a local object URL. */
  async upload(file, { userId, orderId } = {}) {
    await new Promise((r) => setTimeout(r, 350))
    const bucketKey = this.getBucketKey(file)
    // Mirror the real Supabase layout:
    // <bucket>/<userId>/<orderId>/<bucketKey>/<fileName>
    const segments = [userId, orderId, bucketKey].filter(Boolean)
    return {
      path: [...segments, file.name].join('/'),
      bucketKey,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
      demo: true,
    }
  },

  /** Demo signed-URL generator — returns the local preview or nothing. */
  async createSignedUrl(path) {
    return { signedUrl: null, path, demo: true }
  },

  async remove(path) {
    await new Promise((r) => setTimeout(r, 200))
    return { ok: Boolean(path), path, demo: true }
  },
}

export default storageService
