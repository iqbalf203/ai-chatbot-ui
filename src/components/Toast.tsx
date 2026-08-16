import {
  useEffect,
  useState,
} from "react"

export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

interface Toast extends ToastProps {
  id: string
}

let toastId = 0
const toastListeners: Array<
  (toasts: Toast[]) => void
> = []
let currentToasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach(
    (listener) => listener(currentToasts)
  )
}

export function showToast(
  message: string,
  type: ToastType = "info",
  duration = 4000
) {
  const id = `toast-${++toastId}`

  const toast: Toast = {
    id,
    message,
    type,
    duration,
  }

  currentToasts = [
    ...currentToasts,
    toast,
  ]

  notifyListeners()

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

function removeToast(id: string) {
  currentToasts = currentToasts.filter(
    (t) => t.id !== id
  )
  notifyListeners()
}

export function useToasts(): Toast[] {
  const [toasts, setToasts] =
    useState<Toast[]>(currentToasts)

  useEffect(() => {
    toastListeners.push(setToasts)

    return () => {
      const index =
        toastListeners.indexOf(setToasts)
      if (index !== -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])

  return toasts
}

export function ToastContainer() {
  const toasts = useToasts()

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
        >
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === "success" &&
                "✓"}
              {toast.type === "error" &&
                "✕"}
              {toast.type === "warning" &&
                "!"}
              {toast.type === "info" &&
                "i"}
            </span>
            <span className="toast-message">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() =>
              removeToast(toast.id)
            }
            className="toast-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
