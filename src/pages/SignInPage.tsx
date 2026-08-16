import {
  useState,
  useCallback,
  useEffect,
} from "react"

import type {
  FormErrors,
  SignInRequest,
} from "../types/auth"

import { useAuth } from "../context/AuthContext"

import { FormInput } from "../components/FormInput"
import {
  FormPasswordInput,
} from "../components/FormPasswordInput"
import { FormCheckbox } from "../components/FormCheckbox"
import { FormButton } from "../components/FormButton"
import { showToast } from "../components/Toast"
import {
  validateSignInForm,
} from "../utils/validators"
import { AuthAPIError } from "../services/authApi"

interface SignInPageProps {
  onSwitchMode: () => void
}

export function SignInPage({
  onSwitchMode,
}: SignInPageProps) {
  const { signIn, isLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] =
    useState("")
  const [rememberMe, setRememberMe] =
    useState(false)
  const [errors, setErrors] =
    useState<FormErrors>({})

  // Load remembered email
  useEffect(() => {
    const remembered =
      localStorage.getItem(
        "remembered_email"
      )
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const formErrors = validateSignInForm(
        email,
        password
      )

      if (
        Object.keys(formErrors).length >
        0
      ) {
        setErrors(formErrors)
        return
      }

      setErrors({})

      try {
        const request: SignInRequest = {
          email,
          password,
        }

        await signIn(request)

        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem(
            "remembered_email",
            email
          )
        } else {
          localStorage.removeItem(
            "remembered_email"
          )
        }

        showToast(
          "Sign in successful!",
          "success"
        )

        // Redirect happens via higher-order component
      } catch (error) {
        if (
          error instanceof
          AuthAPIError
        ) {
          setErrors({
            submit: error.detail,
          })
        } else if (
          error instanceof Error
        ) {
          setErrors({
            submit: error.message,
          })
        } else {
          setErrors({
            submit:
              "An error occurred. Please try again.",
          })
        }

        showToast(
          errors.submit ||
            "Sign in failed",
          "error",
          5000
        )
      }
    },
    [email, password, rememberMe, signIn]
  )

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-container">
        <div className="auth-form-header">
          <h1 className="auth-form-title">
            Welcome Back
          </h1>
          <p className="auth-form-subtitle">
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
          noValidate
        >
          {errors.submit && (
            <div className="form-submit-error">
              <span className="form-submit-error-icon">
                ⚠
              </span>
              <span>
                {errors.submit}
              </span>
            </div>
          )}

          <FormInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            error={errors.email}
            containerClassName="form-group"
            autoComplete="email"
            required
            icon="✉️"
          />

          <FormPasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            error={errors.password}
            containerClassName="form-group"
            autoComplete="current-password"
            required
          />

          <div className="auth-form-options">
            <FormCheckbox
              id="remember-me"
              label="Remember me"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
            />

            <a
              href="#"
              className="auth-form-link"
              onClick={(e) => {
                e.preventDefault()
                showToast(
                  "Password reset coming soon!",
                  "info"
                )
              }}
            >
              Forgot password?
            </a>
          </div>

          <FormButton
            isLoading={isLoading}
            loadingText="Signing in..."
            className="w-full"
          >
            Sign In
          </FormButton>

          <div className="auth-form-divider" />

          <div className="auth-form-footer">
            <span className="auth-form-footer-text">
              Don't have an account?
            </span>
            <button
              type="button"
              onClick={onSwitchMode}
              className="auth-form-footer-link"
            >
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
