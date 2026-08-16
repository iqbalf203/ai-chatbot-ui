# Authentication Quick Reference

## 🚀 Quick Start

### 1. Use Auth Context
```typescript
import { useAuth } from "./context/AuthContext"

const { user, isAuthenticated, signIn, signOut } = useAuth()
```

### 2. Sign In
```typescript
try {
  await signIn({
    email: "user@example.com",
    password: "Password123!"
  })
} catch (error) {
  console.error("Failed:", error)
}
```

### 3. Sign Up
```typescript
try {
  await signUp({
    name: "John Doe",
    email: "john@example.com",
    password: "Password123!"
  })
} catch (error) {
  console.error("Failed:", error)
}
```

### 4. Sign Out
```typescript
signOut()
// User is redirected to auth page
```

---

## 📋 Form Components

### FormInput
```typescript
<FormInput
  id="email"
  label="Email"
  type="email"
  placeholder="user@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  icon="✉️"
  containerClassName="form-group"
/>
```

### FormPasswordInput
```typescript
<FormPasswordInput
  id="password"
  label="Password"
  placeholder="Enter password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={errors.password}
  containerClassName="form-group"
/>
```

### FormCheckbox
```typescript
<FormCheckbox
  id="remember"
  label="Remember me"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
/>
```

### FormButton
```typescript
<FormButton
  isLoading={isLoading}
  loadingText="Signing in..."
  variant="primary"
>
  Sign In
</FormButton>
```

---

## 🎯 Validation

### Validate Sign In
```typescript
import { validateSignInForm } from "./utils/validators"

const errors = validateSignInForm(email, password)
if (Object.keys(errors).length > 0) {
  setErrors(errors)
}
```

### Validate Sign Up
```typescript
import { validateSignUpForm } from "./utils/validators"

const errors = validateSignUpForm(
  name,
  email,
  password,
  confirmPassword
)
```

### Custom Validation
```typescript
import { validators } from "./utils/validators"

const emailError = validators.email(email)
const passwordError = validators.password(password)
```

---

## 🔔 Toast Notifications

### Show Toast
```typescript
import { showToast } from "./components/Toast"

showToast("Success!", "success")
showToast("Error occurred", "error")
showToast("Warning", "warning")
showToast("Info message", "info")
```

### Toast Types
- `"success"` - Green
- `"error"` - Red
- `"warning"` - Amber
- `"info"` - Blue

### Duration
```typescript
// Auto-dismiss after 4 seconds (default)
showToast("Message", "success")

// Auto-dismiss after 5 seconds
showToast("Message", "error", 5000)

// Don't auto-dismiss
showToast("Message", "info", 0)
```

---

## 🔐 Protected Requests

### With Hook
```typescript
import { useAuth } from "./context/AuthContext"

function MyComponent() {
  const { getToken } = useAuth()

  const fetchData = async () => {
    const token = getToken()
    const response = await fetch("/api/data", {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.json()
  }
}
```

### Direct
```typescript
const token = localStorage.getItem("auth_token")
fetch("/api/data", {
  headers: { Authorization: `Bearer ${token}` }
})
```

---

## 📦 API Errors

### Handle Errors
```typescript
import { AuthAPIError } from "./services/authApi"

try {
  await signIn(credentials)
} catch (error) {
  if (error instanceof AuthAPIError) {
    console.log("Status:", error.status)
    console.log("Message:", error.detail)
  }
}
```

### Error Codes
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (email already exists)
- `500` - Server error

---

## 🎨 Styling Reference

### Dark Theme Colors
```css
Primary: #5a46b4    /* Purple/Blue */
Success: #22c55e    /* Green */
Error: #ef4444      /* Red */
Warning: #f59e0b    /* Amber */
Info: #3b82f6       /* Blue */

Text Primary: #ffffff
Text Secondary: #a5abb4
Text Subtle: #6b7280

Background: #0b0d10
Card: rgba(23, 26, 31, 0.8)
Border: #30343b
```

### CSS Classes
```css
.auth-page               /* Full page container */
.auth-form-container     /* Form card */
.form-group              /* Form field group */
.form-input              /* Text input */
.form-input-error        /* Error input state */
.form-button             /* Submit button */
.form-button-primary     /* Primary button style */
.toast-container         /* Toast wrapper */
.toast                   /* Individual toast */
.user-menu-dropdown      /* User menu */
```

---

## 🔑 Storage Keys

```javascript
// Tokens and User Data
localStorage.getItem("auth_token")      // JWT token
localStorage.getItem("auth_user")       // User object
localStorage.getItem("remembered_email") // Email for "Remember Me"

// Clear Session
localStorage.removeItem("auth_token")
localStorage.removeItem("auth_user")
```

---

## 🧪 Common Patterns

### Redirect After Login
```typescript
// Automatic via useAuth in AuthPage
const { isAuthenticated } = useAuth()
if (isAuthenticated) {
  window.location.href = "/"
}
```

### Conditional Rendering
```typescript
const { isAuthenticated, user } = useAuth()

return (
  <>
    {isAuthenticated ? (
      <p>Welcome, {user?.name}</p>
    ) : (
      <p>Please sign in</p>
    )}
  </>
)
```

### Loading State
```typescript
const { isLoading } = useAuth()

return (
  <FormButton
    isLoading={isLoading}
    disabled={isLoading}
  >
    Sign In
  </FormButton>
)
```

---

## 🚨 Error Handling Examples

### Email Already Registered
```typescript
try {
  await signUp(data)
} catch (error) {
  if (error instanceof AuthAPIError) {
    if (error.status === 409) {
      setErrors({ submit: "Email already registered" })
    }
  }
}
```

### Invalid Credentials
```typescript
try {
  await signIn(credentials)
} catch (error) {
  if (error instanceof AuthAPIError) {
    if (error.status === 401) {
      setErrors({ submit: "Invalid email or password" })
    }
  }
}
```

### Network Error
```typescript
try {
  await signIn(credentials)
} catch (error) {
  if (error instanceof Error) {
    showToast(error.message, "error")
  }
}
```

---

## 📱 Responsive Behavior

### Mobile Adjustments
- Full-width forms with padding
- Larger touch targets (44px minimum)
- Stack all elements vertically
- Adjusted font sizes
- Simplified layout

### Breakpoints
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

---

## ⚡ Performance Tips

1. **Memoize callbacks** in form components
2. **Use useCallback** for event handlers
3. **Lazy load** pages if needed
4. **Cache token** to avoid repeated lookups
5. **Debounce** validation checks

---

## 🔍 Debugging

### Check Token
```typescript
console.log(localStorage.getItem("auth_token"))
```

### Check User Data
```typescript
console.log(JSON.parse(localStorage.getItem("auth_user")))
```

### Monitor API Calls
```typescript
// Open DevTools Network tab
// Watch for /api/auth/* requests
```

### Check Auth Context
```typescript
const { user, isAuthenticated } = useAuth()
console.log({ user, isAuthenticated })
```

---

## 📚 File Locations

```
src/
├── context/AuthContext.tsx
├── pages/
│   ├── AuthPage.tsx
│   ├── SignInPage.tsx
│   └── SignUpPage.tsx
├── components/
│   ├── FormInput.tsx
│   ├── FormPasswordInput.tsx
│   ├── FormCheckbox.tsx
│   ├── FormButton.tsx
│   └── Toast.tsx
├── services/authApi.ts
├── types/auth.ts
├── utils/validators.ts
└── auth.css
```

---

## 🎯 Next Steps

1. Update backend endpoints if needed
2. Configure environment variables
3. Test sign up/in flows
4. Integrate with protected routes
5. Deploy to production
