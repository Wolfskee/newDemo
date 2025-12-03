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

## Notes

- Authentication is currently simulated for demo purposes
- In production, you should integrate with a real authentication service
- Product and service data are currently hardcoded - connect to a database in production
