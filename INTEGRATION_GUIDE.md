# Frontend-Backend Integration Guide

## Architecture Overview

This document explains how the frontend and backend are connected with JWT authentication.

```
Frontend (Next.js)
│
├── AuthContext (Global State)
├── authService (API calls)
├── Axios Interceptors (Token attachment)
└── Protected Routes
     │
     └── Backend (Express.js)
         │
         ├── Auth Routes
         ├── Auth Middleware (Bearer token validation)
         └── JWT Token Generation
```

## File Structure

```
frontend/
├── context/
│   └── AuthContext.jsx          # Global auth state management
├── services/
│   └── authService.js           # API calls & localStorage
├── lib/
│   └── axios.js                 # Axios instance with interceptors
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   └── common/
│       ├── Input.jsx             # Form input component
│       ├── Button.jsx            # Reusable button
│       └── Loader.jsx            # Loading spinner
├── app/
│   ├── layout.jsx               # Root layout with AuthProvider
│   ├── login/
│   │   └── page.jsx             # Login page
│   ├── register/
│   │   └── page.jsx             # Register page
│   └── dashboard/
│       └── page.jsx             # Protected dashboard
└── .env.local                   # Environment variables
```

## Setup Instructions

### 1. Environment Variables

Your `.env.local` is already configured:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Backend Requirements

Ensure your backend has these endpoints:

**POST /api/auth/register**
- Request: `{ name, email, password, phone, location?, profileImage?, rating? }`
- Response: `{ success: true, user: {...}, token: "jwt_token" }`

**POST /api/auth/login**
- Request: `{ email, password }`
- Response: `{ success: true, user: {...}, token: "jwt_token" }`

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Response: `{ success: true, user: {...} }`

### 3. How It Works

#### Step 1: User Registers/Logs In
```
User fills form → Register/Login component 
  → authService.register/login() 
  → Axios POST request 
  → Token stored in localStorage
  → Auth Context updated
```

#### Step 2: Axios Interceptor Attaches Token
```
Any API request 
  → Interceptor reads token from localStorage 
  → Adds: Authorization: Bearer <token>
  → Sends request to backend
```

#### Step 3: Backend Validates Token
```
Backend receives request 
  → authMiddleware validates Bearer token 
  → JWT.verify(token, JWT_SECRET)
  → Attaches user to request 
  → Proceeds to route handler
```

#### Step 4: Protected Routes
```
User tries to access /dashboard 
  → ProtectedRoute checks isAuthenticated 
  → If true: Renders page 
  → If false: Redirects to /login
```

#### Step 5: Token Expiration
```
If 401 response received 
  → Interceptor clears localStorage 
  → Redirects to /login 
  → User re-authenticates
```

## Authentication Flow

### Registration Flow
```
1. User submits form
2. authService.register() sends POST to /api/auth/register
3. Backend hashes password, creates user, generates JWT
4. Frontend receives { user, token }
5. Token + user stored in localStorage
6. AuthContext state updated
7. User redirected to /dashboard
```

### Login Flow
```
1. User submits credentials
2. authService.login() sends POST to /api/auth/login
3. Backend validates credentials, generates JWT
4. Frontend receives { user, token }
5. Token + user stored in localStorage
6. AuthContext state updated
7. User redirected to /dashboard
```

### Protected Request Flow
```
1. Component requests data (e.g., GET /api/users/me)
2. Axios interceptor reads token from localStorage
3. Adds Authorization header: Bearer <token>
4. Backend authMiddleware validates token
5. If valid: Attaches user to req.user, continues
6. If invalid/expired: Returns 401, triggers logout
```

### Logout Flow
```
1. User clicks logout
2. logout() clears localStorage (token + user)
3. AuthContext state cleared
4. User redirected to /login
```

## Key Components Explained

### AuthContext.jsx
- Manages global auth state (user, token, loading, isAuthenticated)
- Provides auth functions: register(), login(), logout(), updateUser()
- Initializes auth from localStorage on mount
- Wraps entire app in `app/layout.jsx`

### authService.js
- Pure functions for auth API calls
- Handles localStorage interaction
- Returns consistent error/success format
- Used by both components and AuthContext

### axios.js (Interceptors)
```javascript
// Request Interceptor
- Reads token from localStorage
- Attaches to Authorization header
- Sends with every request

// Response Interceptor
- Catches 401 errors (expired token)
- Clears localStorage
- Redirects to /login
```

### ProtectedRoute.jsx
- Wraps sensitive pages (dashboard, profile)
- Checks isAuthenticated from AuthContext
- Shows Loader if still initializing
- Redirects to /login if not authenticated

## Usage in Components

### Example 1: Using Auth in a Component
```javascript
'use client';
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (isAuthenticated) {
    return <p>Welcome, {user.name}!</p>
  }
  return <p>Please login</p>
}
```

### Example 2: Making Protected API Calls
```javascript
import axiosInstance from '@/lib/axios';

// Token automatically attached by interceptor
const response = await axiosInstance.get('/api/users/me');
```

### Example 3: Protecting a Route
```javascript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <h1>Dashboard</h1>
    </ProtectedRoute>
  );
}
```

## Common Tasks

### Adding New Protected Routes
1. Create page in `app/[route]/page.jsx`
2. Wrap content in `<ProtectedRoute>`
3. Intercept with authMiddleware in backend
4. Automatically gets token via interceptor

### Adding New API Endpoints
1. In backend, create route
2. Use `authMiddleware` if protected
3. In frontend, import `axiosInstance` 
4. Make call with `axiosInstance.get/post/etc()`
5. Token auto-attached by interceptor

### Debugging Auth Issues
1. Check localStorage: `localStorage.getItem('token')`
2. Check AuthContext: `console.log(useAuth())`
3. Check API response: Network tab in DevTools
4. Verify JWT_SECRET matches in backend `.env`

## Frontend Pages

- **`/login`** - Login form, redirects to dashboard on success
- **`/register`** - Registration form, redirects to dashboard on success
- **`/dashboard`** - Protected route, shows user info
- **`/`** - Public home page

## Security Features

✅ JWT tokens stored in localStorage
✅ Token automatically attached to all requests
✅ Expired tokens trigger re-authentication
✅ Protected routes prevent unauthorized access
✅ Passwords hashed on backend (bcryptjs)
✅ Tokens set to expire after 7 days

## Troubleshooting

### "Cannot find module" errors
- Ensure all file paths use `@/` alias correctly
- Check `jsconfig.json` for path aliases

### 401 Unauthorized errors
- Check token exists in localStorage
- Verify JWT_SECRET in backend matches token generation
- Check token hasn't expired

### Components not updating after login
- Ensure component uses `useAuth()` hook
- Check AuthContext is provided in layout
- Verify state updates trigger re-render

### CORS errors
- Backend: Ensure `cors()` middleware is enabled
- Frontend: Verify `NEXT_PUBLIC_API_URL` points to correct backend

## Next Steps

1. Implement forgot password functionality
2. Add email verification
3. Add profile update endpoint
4. Add refresh token rotation
5. Add role-based access control (RBAC)
6. Implement 2FA (Two-Factor Authentication)

## References

- [JWT Documentation](https://jwt.io/)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Next.js Context](https://react.dev/reference/react/useContext)
- [Bearer Token](https://tools.ietf.org/html/rfc6750)
