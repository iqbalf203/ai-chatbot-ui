import type {
  InputHTMLAttributes,
  ReactNode,
} from "react"

interface FormInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  containerClassName?: string
}

export function FormInput({
  label,
  error,
  icon,
  containerClassName = "",
  id,
  ...props
}: FormInputProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={id}
          className="form-label"
        >
          {label}
        </label>
      )}

      <div className="form-input-wrapper">
        {icon && (
          <span className="form-input-icon">
            {icon}
          </span>
        )}

        <input
          id={id}
          className={`form-input ${
            error ? "form-input-error" : ""
          } ${icon ? "form-input-with-icon" : ""}`}
          {...props}
        />
      </div>

      {error && (
        <span className="form-error">
          {error}
        </span>
      )}
    </div>
  )
}
