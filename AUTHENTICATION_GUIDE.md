# Enterprise Authentication System Documentation

## Overview

A complete JWT-based authentication system for React + TypeScript frontend with FastAPI backend. Includes sign-up, sign-in, token management, session persistence, and a polished enterprise UI.

---

## ✨ Features

### Authentication
- ✅ **JWT Token Management** - Secure token storage and retrieval
- ✅ **Session Persistence** - Remembers user across browser refreshes
- ✅ **Sign Up** - Create new accounts with validation
- ✅ **Sign In** - Login with email and password
- ✅ **Sign Out** - Clear session and redirect to auth page
- ✅ **Remember Me** - Option to save email for faster login
- ✅ **Token Refresh** - Handle token expiration

### UI/UX
- ✅ **Responsive Design** - Mobile, tablet, and desktop layouts
- ✅ **Dark Theme** - Premium dark mode matching your chat UI
- ✅ **Loading States** - Spinners and disabled buttons during requests
- ✅ **Form Validation** - Real-time inline error messages
- ✅ **Toast Notifications** - Success and error alerts
- ✅ **Password Visibility Toggle** - Show/hide password input
- ✅ **Smooth Animations** - Fade-in, slide-up transitions
- ✅ **Gradient Buttons** - Modern button styles with hover effects
- ✅ **User Menu** - Profile dropdown in chat header

### Security
- ✅ **Password Strength Validation** - Uppercase, lowercase, numbers, special chars
- ✅ **Email Format Validation** - Proper email regex check
- ✅ **Password Confirmation** - Verify passwords match
- ✅ **Secure Token Storage** - localStorage with fallback
- ✅ **Bearer Token Headers** - Proper Authorization header format
- ✅ **Error Handling** - No sensitive data in logs

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.tsx              # Auth state management
├── pages/
│   ├── AuthPage.tsx                 # Main auth page with toggle
│   ├── SignInPage.tsx               # Sign in form
│   └── SignUpPage.tsx               # Sign up form
├── components/
│   ├── FormInput.tsx                # Text input component
│   ├── FormPasswordInput.tsx         # Password input with toggle
│   ├── FormCheckbox.tsx             # Checkbox component
│   ├── FormButton.tsx               # Submit button with loading
│   ├── Toast.tsx                    # Toast notifications
│   └── ChatHeader.tsx               # Updated with user menu
├── services/
│   └── authApi.ts                   # API service with error handling
├── types/
│   └── auth.ts                      # TypeScript types
├── utils/
│   └── validators.ts                # Form validation functions
├── auth.css                         # Authentication styles
├── App.tsx                          # Chat app (updated)
└── main.tsx                         # Entry point (updated)
```

---

## 🔄 Authentication Flow

### Sign Up Flow
```
User fills form
  ↓
Client validates inputs
  ↓
POST /api/auth/signup
  ↓
Backend creates user
  ↓
Response with user data
  ↓
Show success toast
  ↓
Auto-switch to sign in (1.5s delay)
```

### Sign In Flow
```
User fills email & password
  ↓
Client validates inputs
  ↓
POST /api/auth/login
  ↓
Backend generates JWT
  ↓
Response with access_token
  ↓
Store token in localStorage
  ↓
Store user in localStorage
  ↓
Update auth context
  ↓
Auto-redirect to chat app
```

### App Load Flow
```
App starts
  ↓
AuthProvider initializes
  ↓
Check localStorage for token & user
  ↓
Set isLoading = false
  ↓
If token exists: Show chat app
  ↓
If no token: Show auth page
```

---

## 🚀 API Integration

### Backend Endpoints

**POST /api/auth/signup**
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass123!"
}

Success (200):
{
  "message": "User created successfully",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

Error (409):
{
  "detail": "Email already registered"
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}

Success (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

Error (401):
{
  "detail": "Invalid email or password"
}
```

**GET /api/auth/me**
```
Headers: Authorization: Bearer <token>

Success (200):
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com"
}

Error (401):
{
  "detail": "Invalid authentication credentials"
}
```

### Making Protected Requests

```typescript
import { useAuth } from "./context/AuthContext"

function MyComponent() {
  const { getToken } = useAuth()

  const fetchData = async () => {
    const token = getToken()

    const response = await fetch(
      "http://localhost:8000/api/protected",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.json()
  }
}
```

---

## 💾 Token Storage

### localStorage Keys
```
auth_token      → JWT access token
auth_user       → User object (JSON stringified)
remembered_email → Email for "Remember Me"
```

### Token Lifecycle
1. **Generated** - Backend creates JWT on login
2. **Stored** - Client saves to localStorage
3. **Sent** - Included in Authorization header on protected requests
4. **Verified** - Backend validates signature
5. **Expired** - Client removes from storage when invalid
6. **Cleared** - Deleted on logout

---

## 🔐 Security Features

### Password Validation Rules
- **Minimum 8 characters**
- **At least one uppercase letter** (A-Z)
- **At least one lowercase letter** (a-z)
- **At least one number** (0-9)
- **At least one special character** (@$!%*?&)

### Email Validation
- Standard email format validation
- Checks for @ and domain

### Error Handling
- No password echoed in errors
- Generic "Invalid email or password" message
- Specific field errors for validation
- API error details mapped to form fields

---

## 🎨 Theme & Styling

### Color Palette (Matching Chat UI)
```css
/* Background */
Primary Background: #0b0d10
Card Background: rgba(23, 26, 31, 0.8)
Sidebar Background: rgba(17, 19, 23, 0.92)

/* Text */
Primary Text: #ffffff
Secondary Text: #a5abb4
Subtle Text: #6b7280

/* Accents */
Primary Accent: #5a46b4 (Purple/Blue)
Success: #22c55e (Green)
Error: #ef4444 (Red)
Warning: #f59e0b (Amber)

/* Borders */
Border Color: #30343b
Subtle Border: #24272d

/* Hover/Focus */
Hover Background: rgba(90, 70, 180, 0.1)
Focus Shadow: rgba(90, 70, 180, 0.3)
```

### Key Components Styling
- **Cards**: Frosted glass effect with blur
- **Buttons**: Gradient backgrounds with smooth transitions
- **Inputs**: Dark backgrounds with colored borders on focus
- **Badges**: Small rounded backgrounds
- **Shadows**: Soft shadows for depth
- **Animations**: Smooth fade-in, slide-up transitions

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
- Full width forms (420px max)
- Two-column layouts possible
- Large touch targets

### Tablet (768px - 1023px)
- Medium width forms
- Stack layout
- Adjusted padding/margins

### Mobile (< 768px)
- Full width minus padding
- Touch-friendly buttons (44px minimum)
- Larger font sizes for readability
- Vertical spacing optimized

---

## 🧪 Testing Checklist

### Sign Up
- [ ] All fields required validation
- [ ] Email format validation
- [ ] Password strength feedback
- [ ] Password confirmation check
- [ ] Terms acceptance required
- [ ] Loading spinner shows during submission
- [ ] Success toast appears
- [ ] Auto-switch to sign in
- [ ] Error messages display correctly
- [ ] Submit button disabled during loading

### Sign In
- [ ] Email required validation
- [ ] Password required validation
- [ ] Remember me saves email
- [ ] Forgot password link works
- [ ] Loading spinner shows
- [ ] Success redirects to chat
- [ ] Error messages show
- [ ] Submit button disabled during loading

### Mobile
- [ ] Responsive at 375px width
- [ ] Touch targets are 44px minimum
- [ ] Keyboard doesn't cover inputs
- [ ] Toast notifications visible
- [ ] Form fields auto-fill correctly

---

## 🔧 Configuration

### Environment Variables
```bash
# .env or .env.local
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Token Configuration
```typescript
// In AuthContext.tsx
const STORAGE_KEY = "auth_token"
const USER_STORAGE_KEY = "auth_user"
```

---

## 📚 Usage Examples

### Using Auth Context

```typescript
import { useAuth } from "./context/AuthContext"

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    getToken,
    setToken,
  } = useAuth()

  // Check if user is logged in
  if (!isAuthenticated) {
    return <p>Please sign in</p>
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={signOut}>
        Logout
      </button>
    </div>
  )
}
```

### Protected Component

```typescript
import { useAuth } from "./context/AuthContext"
import { useEffect, useState } from "react"

function ProtectedComponent() {
  const { getToken } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken()

      if (!token) return

      const response = await fetch(
        "http://localhost:8000/api/data",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const json = await response.json()
      setData(json)
    }

    fetchData()
  }, [getToken])

  return <div>{JSON.stringify(data)}</div>
}
```

### Sign In Example

```typescript
const { signIn } = useAuth()

const handleSignIn = async () => {
  try {
    await signIn({
      email: "user@example.com",
      password: "Password123!",
    })
    // User is now signed in
    // Redirect happens automatically
  } catch (error) {
    console.error("Sign in failed:", error)
  }
}
```

---

## 🐛 Troubleshooting

### Token Not Persisting
- Check localStorage is enabled in browser
- Verify STORAGE_KEY name is consistent
- Check browser's private/incognito mode restrictions

### API Errors
- Verify backend URL in .env
- Check CORS is configured on backend
- Ensure token includes "Bearer " prefix

### Form Not Validating
- Check validators.ts logic
- Verify form field names match
- Check error state is updated

### Redirect Not Working
- Check isAuthenticated state updates
- Verify AuthProvider wraps entire app
- Check window.location.href works

---

## 🚀 Production Checklist

- [ ] Environment variables set correctly
- [ ] Backend URL points to production
- [ ] HTTPS enforced for token transmission
- [ ] Secure cookie option enabled (optional)
- [ ] CORS whitelist configured
- [ ] Rate limiting enabled on auth endpoints
- [ ] Error messages are user-friendly
- [ ] Loading states show clearly
- [ ] Mobile testing completed
- [ ] Accessibility audit passed
- [ ] TypeScript strict mode enabled
- [ ] All forms tested in different browsers

---

## 📖 File Reference

### core Files

**[AuthContext.tsx](../src/context/AuthContext.tsx)**
- Global auth state management
- Token storage/retrieval
- Sign in/up/out logic

**[authApi.ts](../src/services/authApi.ts)**
- API communication
- Error handling
- Request/response types

**[validators.ts](../src/utils/validators.ts)**
- Form validation logic
- Email and password rules
- Field error generation

### Pages

**[AuthPage.tsx](../src/pages/AuthPage.tsx)**
- Main auth layout
- Toggle between sign in/up
- Branding and animations

**[SignInPage.tsx](../src/pages/SignInPage.tsx)**
- Sign in form
- Remember me checkbox
- Forgot password link

**[SignUpPage.tsx](../src/pages/SignUpPage.tsx)**
- Sign up form
- Terms acceptance
- Auto-redirect on success

### Components

**[FormInput.tsx](../src/components/FormInput.tsx)**
- Text input with label
- Error message display
- Icon support

**[FormPasswordInput.tsx](../src/components/FormPasswordInput.tsx)**
- Password input
- Visibility toggle
- Error handling

**[FormCheckbox.tsx](../src/components/FormCheckbox.tsx)**
- Checkbox with label
- Custom styling

**[FormButton.tsx](../src/components/FormButton.tsx)**
- Submit button
- Loading spinner
- Disabled state

**[Toast.tsx](../src/components/Toast.tsx)**
- Toast notifications
- Multiple types
- Auto-dismiss

### Styling

**[auth.css](../src/auth.css)**
- Complete authentication UI
- Responsive breakpoints
- Dark theme colors
- Animations and transitions

---

## 🤝 Integration with Chat App

The auth system integrates seamlessly:

1. **AuthProvider wraps entire app** in main.tsx
2. **RootContent checks authentication** and renders appropriate page
3. **ChatHeader shows user menu** with logout
4. **Logout redirects to auth** page automatically
5. **Protected endpoints** use token from context

---

## 📞 Support

For issues or questions:

1. Check browser console for errors
2. Verify backend is running
3. Check environment variables
4. Review error message details
5. Check API response format
6. Verify token format in storage

---

## Version Info

- React: 19.2.8
- TypeScript: 6.0.2
- Vite: 8.2.0
- No external UI libraries (pure CSS)
