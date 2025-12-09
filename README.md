# RentSafe-Frontend

This repo will be used for managing Renter and agent workflow.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

Dependencies have already been installed. If you need to reinstall:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Build

To build for production:

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
RentSafe-Frontend/
├── src/
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind directives
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Tailwind CSS

Tailwind CSS is fully configured and ready to use. You can start using Tailwind utility classes in your components right away.

Example:
```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello Tailwind!
</div>
```

## Authentication Flow

The application includes a complete authentication flow:

1. **Login Page** (`/login`) - User login with email and password
2. **Forgot Password** (`/forgot-password`) - Request password reset via email
3. **OTP Verification** (`/otp-verification`) - Verify 6-digit OTP code
4. **Create New Password** (`/create-password`) - Set new password with validation
5. **Password Success** (`/password-success`) - Success confirmation page

### Features Implemented:

- ✅ Form validation with error messages
- ✅ Password visibility toggle
- ✅ Remember me checkbox
- ✅ Email masking for privacy
- ✅ OTP input with auto-focus and paste support
- ✅ Password strength requirements validation
- ✅ Responsive design matching the provided designs
- ✅ Purple gradient theme throughout

### Testing the Flow:

1. Start at `/login` page
2. Click "Forgot Password?" link
3. Enter email (use `abc123@example.com` for demo to proceed)
4. Complete OTP verification
5. Create new password with validation
6. See success confirmation
