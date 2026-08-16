import type { FormErrors } from "../types/auth"

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

export const validators = {
  email: (email: string): string | null => {
    if (!email.trim()) {
      return "Email is required"
    }

    if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email"
    }

    return null
  },

  password: (
    password: string
  ): string | null => {
    if (!password) {
      return "Password is required"
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }

    if (!PASSWORD_REGEX.test(password)) {
      return "Password must contain uppercase, lowercase, number, and special character"
    }

    return null
  },

  confirmPassword: (
    password: string,
    confirmPassword: string
  ): string | null => {
    if (!confirmPassword) {
      return "Please confirm your password"
    }

    if (password !== confirmPassword) {
      return "Passwords do not match"
    }

    return null
  },

  name: (name: string): string | null => {
    if (!name.trim()) {
      return "Full name is required"
    }

    if (name.trim().length < 2) {
      return "Name must be at least 2 characters"
    }

    if (name.trim().length > 100) {
      return "Name must be less than 100 characters"
    }

    return null
  },
}

export const validateSignUpForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FormErrors => {
  const errors: FormErrors = {}

  const nameError =
    validators.name(name)
  if (nameError) {
    errors.name = nameError
  }

  const emailError =
    validators.email(email)
  if (emailError) {
    errors.email = emailError
  }

  const passwordError =
    validators.password(password)
  if (passwordError) {
    errors.password = passwordError
  }

  const confirmError =
    validators.confirmPassword(
      password,
      confirmPassword
    )
  if (confirmError) {
    errors.confirmPassword =
      confirmError
  }

  return errors
}

export const validateSignInForm = (
  email: string,
  password: string
): FormErrors => {
  const errors: FormErrors = {}

  const emailError =
    validators.email(email)
  if (emailError) {
    errors.email = emailError
  }

  if (!password) {
    errors.password =
      "Password is required"
  }

  return errors
}
