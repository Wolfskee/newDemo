# Next.js Products & Services Website

A modern website built with Next.js, Tailwind CSS, and NextUI to showcase products and services with user authentication and admin portal.

## Features

- 🏠 **Home Page**: Beautiful hero section with products and services preview
- 📦 **Products Page**: Detailed product listings with images and descriptions
- 🛠️ **Services Page**: Comprehensive service offerings
- 👤 **User Authentication**: Login and registration for regular users
- 🔐 **Admin Portal**: Separate admin/employee login at `/admin`
- 📊 **Admin Dashboard**: Management dashboard for admins and employees

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextUI** - UI component library
- **Framer Motion** - Animations

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

### `app/`
Contains the **Next.js App Router** structure. This directory defines the routing of the application.
- Each folder inside represents a route segment (e.g., `app/login` -> `/login`).
- `page.tsx`: The UI for a route.
- `layout.tsx`: Shared UI for a segment and its children.
- `api/`: API routes (backend logic).

### `features/`
This project follows a **Feature-Based Architecture**. Most of the business logic and feature-specific UI lives here, keeping the `app/` directory clean.
- **admin/**: Functionality for admin users (dashboard, scheduling, user management).
- **auth/**: Authentication logic (login, register forms).
- **cart/**: Shopping cart logic and components.
- **products/**: Product listing and details.
- **profile/**: User profile management.
- **services/**: Service listings or business services.
- **home/**: Components specific to the landing page.

Inside each feature folder (e.g., `features/admin/`), you will typically find:
- `components/`: Components specific to that feature.
- `hooks/`: Custom hooks for that feature.
- `types/`: TypeScript types specific to that feature.

### `components/`
Contains **Shared/Common UI Components** that are used across multiple features.
- Examples: Buttons, Inputs, Modals, Navbars, Footers.
- These components are generic and not tied to specific business logic.

### `lib/`
Contains **Utility Functions and Libraries**.
- `api-client.ts`: Wrapper for making API requests (GET, POST, PUT, DELETE).
- Helper functions, formatting utilities, and external library configurations.

### `contexts/`
Contains **Global React Contexts**.
- Used for state management that needs to be accessible throughout the app (e.g., Shopping Cart state, User Session state).

### `types/`
Contains **Global TypeScript Type Definitions**.
- Interfaces and types that are shared across the application (e.g., `User`, `Product`, `ApiResponse` types).

### `public/`
Static assets like images, fonts, and icons.

### Configuration Files

- `package.json`: Project dependencies and scripts.
- `next.config.js`: Next.js configuration.
- `tailwind.config.js`: Tailwind CSS configuration (styling).
- `tsconfig.json`: TypeScript configuration.

## Demo Credentials

### Regular Users
- Any email/password combination works for demo purposes

### Admin Portal
- **Admin**: `admin@example.com` (any password)
- **Employee**: `employee@example.com` (any password)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# SMTP Email Server Configuration
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
BUSINESS_EMAIL=business@example.com

# Google Maps API (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Maps Embed API"
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

**Note:** The map will still work without an API key, but with limited functionality.

## Notes

- Authentication is currently simulated for demo purposes
- In production, you should integrate with a real authentication service
- Product and service data are currently hardcoded - connect to a database in production
