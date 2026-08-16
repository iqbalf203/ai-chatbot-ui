/* Authentication-related types */

export interface SignUpRequest {
  name: string
  email: string
  password: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface SignUpResponse {
  message: string
  user: User
}

export interface SignInResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ErrorResponse {
  detail: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signUp: (data: SignUpRequest) => Promise<void>
  signIn: (data: SignInRequest) => Promise<void>
  signOut: () => void
  getToken: () => string | null
  setToken: (token: string) => void
}

export interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  submit?: string
}

export interface FieldValidationRules {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validate?: (value: string) => boolean | string
}
