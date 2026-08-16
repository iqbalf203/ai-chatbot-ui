import {
  useState,
  type InputHTMLAttributes,
} from "react"

interface FormPasswordInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerClassName?: string
}

export function FormPasswordInput({
  label,
  error,
  containerClassName = "",
  id,
  ...props
}: FormPasswordInputProps) {
  const [showPassword, setShowPassword] =
    useState(false)

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
        <input
          id={id}
          type={
            showPassword
              ? "text"
              : "password"
          }
          className={`form-input ${
            error ? "form-input-error" : ""
          } form-input-password`}
          {...props}
        />

        <button
          type="button"
          className="password-toggle-btn"
          onClick={() =>
            setShowPassword(!showPassword)
          }
          tabIndex={-1}
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <span title="Hide password">
              👁️
            </span>
          ) : (
            <span title="Show password">
              👁️‍🗨️
            </span>
          )}
        </button>
      </div>

      {error && (
        <span className="form-error">
          {error}
        </span>
      )}
    </div>
  )
}
