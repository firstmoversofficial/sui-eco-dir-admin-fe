# Sui Ecosystem Directory - Admin Dashboard

A modern, responsive admin dashboard for managing the Sui ecosystem directory. Built with React, TypeScript, and Tailwind CSS.

## Features

-   🔐 **Secure Authentication** - Login system with JWT tokens
-   📊 **Dashboard Analytics** - Comprehensive statistics and charts
-   📝 **Project Management** - Full CRUD operations for projects
-   🏷️ **Category Management** - Organize projects by categories
-   🎥 **Video Management** - Manage project videos and media
-   📱 **Responsive Design** - Works on desktop, tablet, and mobile
-   🎨 **Modern UI** - Beautiful, intuitive interface with Tailwind CSS
-   ⚡ **Fast Performance** - Built with Vite for optimal development experience

## Tech Stack

-   **Frontend Framework**: React 18 with TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **State Management**: React Context + React Query
-   **Form Handling**: React Hook Form + Zod validation
-   **Routing**: React Router DOM
-   **Charts**: Recharts
-   **Icons**: Lucide React
-   **HTTP Client**: Axios

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or pnpm
-   Backend API running (see backend documentation)

### Installation

1. Clone the repository and navigate to the admin frontend:

```bash
cd admin-frontend
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar
│   └── ProjectForm.tsx # Project creation/editing form
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── LoginPage.tsx   # Login page
│   ├── DashboardPage.tsx # Main dashboard
│   └── ProjectsPage.tsx # Projects management
├── services/           # API services
│   └── api.ts         # API client and endpoints
├── types/              # TypeScript type definitions
│   └── index.ts       # Shared types and interfaces
├── App.tsx            # Main app component with routing
└── main.tsx           # App entry point
```

## Features Overview

### Authentication

-   Secure login with username/password
-   JWT token-based authentication
-   Protected routes
-   Automatic token refresh
-   Logout functionality

### Dashboard

-   Overview statistics (total projects, active projects, categories, videos)
-   Interactive charts showing project distribution and growth
-   Recent projects list
-   Quick actions for common tasks

### Project Management

-   List all projects with search and filtering
-   Create new projects with comprehensive forms
-   Edit existing projects
-   Delete projects with confirmation
-   Upload project logos and banners
-   Manage project status (active, inactive, pending)
-   Mark projects as featured

### Categories

-   View all categories
-   Create and edit categories
-   Delete categories
-   Category statistics

### Videos

-   Manage project videos
-   Upload video thumbnails
-   Track video views and engagement

## API Integration

The admin dashboard integrates with the backend API through the `apiService`. Key endpoints include:

-   **Authentication**: `/auth/login`, `/auth/logout`, `/auth/me`
-   **Dashboard**: `/admin/dashboard`
-   **Projects**: `/admin/projects`
-   **Categories**: `/admin/categories`
-   **Videos**: `/admin/videos`
-   **File Upload**: `/admin/upload`

## Development

### Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build
-   `npm run lint` - Run ESLint
-   `npm run type-check` - Run TypeScript type checking

### Code Style

-   Use TypeScript for all components
-   Follow React best practices
-   Use Tailwind CSS for styling
-   Implement proper error handling
-   Add loading states for better UX

### Adding New Features

1. Create new page components in `src/pages/`
2. Add routes in `src/App.tsx`
3. Create API endpoints in `src/services/api.ts`
4. Add types in `src/types/index.ts`
5. Update navigation in `src/components/Layout.tsx`

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

-   `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
