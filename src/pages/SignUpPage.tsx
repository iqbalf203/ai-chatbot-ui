import {
  useState,
  useCallback,
} from "react"

import type {
  FormErrors,
  SignUpRequest,
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
  validateSignUpForm,
} from "../utils/validators"
import { AuthAPIError } from "../services/authApi"

interface SignUpPageProps {
  onSwitchMode: () => void
}

export function SignUpPage({
  onSwitchMode,
}: SignUpPageProps) {
  const { signUp, isLoading } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] =
    useState("")
  const [confirmPassword, setConfirmPassword] =
    useState("")
  const [acceptTerms, setAcceptTerms] =
    useState(false)
  const [errors, setErrors] =
    useState<FormErrors>({})

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const formErrors =
        validateSignUpForm(
          name,
          email,
          password,
          confirmPassword
        )

      if (!acceptTerms) {
        formErrors.submit =
          "Please accept the terms and conditions"
      }

      if (
        Object.keys(formErrors).length >
        0
      ) {
        setErrors(formErrors)
        return
      }

      setErrors({})

      try {
        const request: SignUpRequest = {
          name,
          email,
          password,
        }

        await signUp(request)

        showToast(
          "Account created successfully! Please sign in.",
          "success"
        )

        // Switch to sign in after a brief delay
        setTimeout(() => {
          onSwitchMode()
        }, 1500)
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
            "Sign up failed",
          "error",
          5000
        )
      }
    },
    [
      name,
      email,
      password,
      confirmPassword,
      acceptTerms,
      signUp,
      onSwitchMode,
    ]
  )

  return (
    <div className="auth-form-wrapper">
      <div className="auth-form-container">
        <div className="auth-form-header">
          <h1 className="auth-form-title">
            Create Account
          </h1>
          <p className="auth-form-subtitle">
            Join us to get started
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
            id="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            error={errors.name}
            containerClassName="form-group"
            autoComplete="name"
            required
            icon="👤"
          />

          <FormInput
            id="email-signup"
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
            id="password-signup"
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            error={errors.password}
            containerClassName="form-group"
            autoComplete="new-password"
            required
          />

          <FormPasswordInput
            id="confirm-password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            error={errors.confirmPassword}
            containerClassName="form-group"
            autoComplete="new-password"
            required
          />

          <FormCheckbox
            id="accept-terms"
            label={
              <>
                I agree to the{" "}
                <a
                  href="#"
                  className="auth-form-link-inline"
                  onClick={(e) => {
                    e.preventDefault()
                  }}
                >
                  Terms
                </a>
                {" "}and{" "}
                <a
                  href="#"
                  className="auth-form-link-inline"
                  onClick={(e) => {
                    e.preventDefault()
                  }}
                >
                  Privacy Policy
                </a>
              </>
            }
            checked={acceptTerms}
            onChange={(e) =>
              setAcceptTerms(
                e.target.checked
              )
            }
            containerClassName="form-group form-group-terms"
          />

          <FormButton
            isLoading={isLoading}
            loadingText="Creating account..."
            className="w-full"
          >
            Create Account
          </FormButton>

          <div className="auth-form-divider" />

          <div className="auth-form-footer">
            <span className="auth-form-footer-text">
              Already have an account?
            </span>
            <button
              type="button"
              onClick={onSwitchMode}
              className="auth-form-footer-link"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
