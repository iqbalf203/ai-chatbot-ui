import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react"

interface FormButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: "primary" | "secondary"
  icon?: ReactNode
}

export function FormButton({
  isLoading = false,
  loadingText = "Loading...",
  variant = "primary",
  icon,
  children,
  disabled,
  className = "",
  ...props
}: FormButtonProps) {
  const isDisabled =
    isLoading || disabled

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`form-button form-button-${variant} ${isDisabled ? "form-button-disabled" : ""} ${className}`}
      {...props}
    >
      <span className="form-button-content">
        {isLoading && (
          <span className="form-button-spinner" />
        )}

        {icon && (
          <span className="form-button-icon">
            {icon}
          </span>
        )}

        <span>
          {isLoading
            ? loadingText
            : children}
        </span>
      </span>
    </button>
  )
}
