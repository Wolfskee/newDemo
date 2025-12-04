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

```
├── app/
│   ├── admin/          # Admin portal pages
│   │   ├── page.tsx    # Admin login
│   │   └── dashboard/  # Admin dashboard
│   ├── login/          # User login
│   ├── register/       # User registration
│   ├── products/       # Products page
│   ├── services/       # Services page
│   └── page.tsx        # Home page
├── components/         # Reusable components
├── contexts/           # React contexts (Auth)
└── ...
```

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
