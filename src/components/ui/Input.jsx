import { useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

/** Text input with label, hint and inline error. */
export const Input = ({
  label,
  hint,
  error,
  icon: Icon,
  trailing,
  className = '',
  containerClassName = '',
  id: providedId,
  ...rest
}) => {
  const autoId = useId()
  const id = providedId || autoId
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {rest.required && <span className="ml-0.5 text-pink-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-lavender-400"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn('field', Icon && 'pl-12', trailing && 'pr-12', error && 'field-error', className)}
          {...rest}
        />
        {trailing && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="field-error-text">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="field-hint">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

/** Multi-line textarea with the same API as Input. */
export const Textarea = ({
  label,
  hint,
  error,
  className = '',
  containerClassName = '',
  id: providedId,
  rows = 4,
  ...rest
}) => {
  const autoId = useId()
  const id = providedId || autoId

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={cn('field resize-y leading-relaxed', error && 'field-error', className)}
        {...rest}
      />
      {error ? (
        <p className="field-error-text">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  )
}

/** Native select styled to match Input. */
export const Select = ({
  label,
  hint,
  error,
  className = '',
  containerClassName = '',
  id: providedId,
  children,
  ...rest
}) => {
  const autoId = useId()
  const id = providedId || autoId

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <select id={id} className={cn('field cursor-pointer pr-10', error && 'field-error', className)} {...rest}>
        {children}
      </select>
      {error ? (
        <p className="field-error-text">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  )
}
