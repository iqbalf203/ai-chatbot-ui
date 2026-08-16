import type {
  InputHTMLAttributes,
  ReactNode,
} from "react"

interface FormCheckboxProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  containerClassName?: string
}

export function FormCheckbox({
  label,
  containerClassName = "",
  id,
  ...props
}: FormCheckboxProps) {
  return (
    <div
      className={`form-checkbox-wrapper ${containerClassName}`}
    >
      <input
        id={id}
        type="checkbox"
        className="form-checkbox"
        {...props}
      />

      {label && (
        <label
          htmlFor={id}
          className="form-checkbox-label"
        >
          {label}
        </label>
      )}
    </div>
  )
}
