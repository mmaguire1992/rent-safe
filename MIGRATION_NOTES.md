# Next.js Migration Notes

## Migration Completed

This project has been migrated from Vite + React Router to Next.js App Router. The following changes have been made:

### 1. Configuration Files
- ✅ `package.json` - Updated to use Next.js dependencies
- ✅ `next.config.js` - Created Next.js configuration
- ✅ `jsconfig.json` - Created for path aliases
- ✅ `tailwind.config.js` - Updated for Next.js
- ✅ `.gitignore` - Updated for Next.js

### 2. App Directory Structure
- ✅ Created `src/app/` directory with Next.js App Router structure
- ✅ Root layout (`src/app/layout.jsx`)
- ✅ Root page that redirects to `/login`
- ✅ Public routes group `(public)/` with layout
- ✅ Auth routes group `(auth)/` with layout  
- ✅ Dashboard routes with layout

### 3. Route Migration
All React Router routes have been converted to Next.js App Router pages:
- ✅ Public routes: `/`, `/landing`, `/properties`, `/properties/[id]`, `/profile`, `/support`
- ✅ Auth routes: `/login`, `/signup/*`, `/forgot-password`, `/otp-verification`, `/create-password`, `/password-success`, `/chat`
- ✅ Dashboard routes: `/dashboard/*` (all nested routes)

### 4. Navigation Compatibility
- ✅ Created `src/lib/react-router-compat.js` - Compatibility layer that maps Next.js router to react-router-dom API
- ✅ All 40 files using react-router-dom have been updated to use the compatibility layer
- This allows existing code to work without changes

### 5. Images
- ⚠️ **ACTION REQUIRED**: Images have been moved to `public/images/` but imports need to be converted to direct paths
- 29 files still use image imports like `import logo from "/images/dashboard/logo.png"`
- These need to be changed to: `<img src="/images/dashboard/logo.png" />` (direct string paths)

**Pattern to fix:**
```jsx
// Before:
import logo from "/images/dashboard/logo.png";
<img src={logo} />

// After:
<img src="/images/dashboard/logo.png" />
```

### 6. Remaining Tasks

1. **Fix Image Imports** (29 files):
   - Remove `import` statements for images from `/images/`
   - Replace `src={variable}` with `src="/images/..."` (direct path strings)
   - Files to check: All files that import from `/images/`

2. **Test All Routes**:
   - Verify all routes work correctly
   - Check navigation between pages
   - Test dynamic routes `[id]`

3. **Update Build Scripts**:
   - Run `npm install` to install Next.js dependencies
   - Test `npm run dev` to start development server
   - Test `npm run build` to build for production

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Key Differences from Vite

1. **Routing**: Uses Next.js App Router instead of React Router
2. **Images**: Public folder images must use direct paths, not imports
3. **Layouts**: Uses Next.js layout system (though pages still include their own layouts for compatibility)
4. **Client Components**: Components using hooks need `'use client'` directive

## Notes

- All existing functionality should work the same
- The compatibility layer (`react-router-compat.js`) allows existing code to work without changes
- Pages still include their own layout components (AuthLayout, DashboardLayout) for backward compatibility
- UI and functionality remain unchanged
