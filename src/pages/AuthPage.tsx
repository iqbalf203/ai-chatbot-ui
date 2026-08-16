import {
  useState,
  useEffect,
} from "react"

import { SignInPage } from "./SignInPage"
import { SignUpPage } from "./SignUpPage"
import { useAuth } from "../context/AuthContext"

export function AuthPage() {
  const [isSignUp, setIsSignUp] =
    useState(false)
  const { isAuthenticated } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/"
    }
  }, [isAuthenticated])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="auth-page">
      <div className="auth-page-background" />

      <div className="auth-page-content">
        <div className="auth-page-header">
          <div className="auth-page-logo">
            ✦
          </div>
          <div className="auth-page-branding">
            <h1>ChatOS</h1>
            <p>Enterprise AI Chat Platform</p>
          </div>
        </div>

        <div className="auth-page-forms">
          {isSignUp ? (
            <SignUpPage
              onSwitchMode={() =>
                setIsSignUp(false)
              }
            />
          ) : (
            <SignInPage
              onSwitchMode={() =>
                setIsSignUp(true)
              }
            />
          )}
        </div>

        <div className="auth-page-footer">
          <p>
            © 2026 ChatOS. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
