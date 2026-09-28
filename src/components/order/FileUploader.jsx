import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadCloud, X, FileText, Image as ImageIcon, Archive, AlertCircle, Loader2, Paperclip } from 'lucide-react'
import { cn, formatFileSize } from '../../lib/utils'
import storageService from '../../services/storageService'
import { siteConfig } from '../../config/siteConfig'

const ACCEPT_LABEL = 'PDF · DOC · DOCX · PPT · PPTX · JPG · PNG · ZIP'

/** Picks a friendly icon per file type. */
const iconFor = (file) => {
  const type = file.type || ''
  if (type.startsWith('image/')) return ImageIcon
  if (type.includes('zip') || type.includes('compressed')) return Archive
  return FileText
}

/**
 * Drag-and-drop uploader.
 *
 * Files are validated against the allowed extensions/size, and a preview
 * object URL is created for images. Only metadata is persisted with the order
 * (see `storageService` for how to move to Supabase Storage).
 */
const FileUploader = ({
  label = 'Upload your requirements',
  hint,
  files,
  onChange,
  accept,
  variant = 'primary',
  icon: Icon = UploadCloud,
}) => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState([])
  const [uploading, setUploading] = useState(false)

  const maxFiles = siteConfig.upload.maxFiles
  const isRef = variant === 'reference'
  const bucketKey = isRef ? 'references' : 'requirements'

  const handleFiles = async (fileList) => {
    const result = storageService.pickFiles(fileList, files, bucketKey)
    setErrors(result.errors)

    // Simulate the upload round-trip so the UI reflects a real flow.
    if (result.files.length > files.length) {
      setUploading(true)
      try {
        const uploaded = await Promise.all(
          result.files
            .filter((f) => !files.some((e) => e.name === f.name))
            .map((f) => storageService.upload(f)),
        )
        const merged = [
          ...files,
          ...uploaded.map((u) => ({ name: u.name, size: u.size, type: u.type, url: u.url })),
        ]
        onChange(merged)
      } finally {
        setUploading(false)
      }
    }
  }

  const removeFile = (name) => {
    setErrors([])
    onChange(files.filter((f) => f.name !== name))
  }

  const full = files.length >= maxFiles

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="field-label mb-0">{label}</label>
        <span className="shrink-0 font-display text-[11px] font-bold text-ink-muted">
          {files.length}/{maxFiles}
        </span>
      </div>

      {/* Dropzone / button */}
      {!full ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            'relative rounded-3xl border-2 border-dashed p-5 text-center transition-all duration-200 sm:p-6',
            dragging
              ? 'scale-[1.01] border-pink-400 bg-pink-50'
              : isRef
                ? 'border-lavender-300 bg-lavender-50/60 hover:border-lavender-400'
                : 'border-pink-300 bg-pink-50/70 hover:border-pink-400',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept || siteConfig.upload.accept}
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files)
              // allow re-picking the same file
              e.target.value = ''
            }}
          />

          <div className="flex flex-col items-center gap-2.5">
            <span
              className={cn(
                'grid h-12 w-12 place-items-center rounded-2xl text-white shadow-soft',
                isRef ? 'bg-lavender-300' : 'bg-pink-300',
              )}
              aria-hidden="true"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </span>

            <p className="font-display text-base font-bold text-ink">
              {uploading ? 'Uploading…' : 'Drag & drop your files here'}
            </p>
            <p className="font-body text-xs font-semibold text-ink-muted">{ACCEPT_LABEL}</p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn btn-secondary btn-sm mt-1"
            >
              <Paperclip className="h-4 w-4" aria-hidden="true" />
              Browse files
            </button>

            {hint && <p className="mt-1 font-body text-xs text-ink-muted">{hint}</p>}
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-butter-100 px-4 py-3 text-center font-body text-sm font-semibold text-butter-500">
          {maxFiles} files uploaded — remove one to add another.
        </p>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {errors.map((err) => (
            <li key={err} className="flex items-center gap-1.5 text-xs font-semibold text-pink-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {err}
            </li>
          ))}
        </ul>
      )}

      {/* Selected files */}
      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {files.map((file) => {
              const FileIcon = iconFor(file)
              return (
                <motion.li
                  key={file.name}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 rounded-2xl border-2 border-lavender-100 bg-white p-2.5"
                >
                  {file.url ? (
                    <img
                      src={file.url}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lavender-100 text-grape-500">
                      <FileIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-bold text-ink">{file.name}</p>
                    <p className="font-body text-[11px] font-semibold text-ink-muted">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-pink-50 hover:text-pink-600"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUploader
