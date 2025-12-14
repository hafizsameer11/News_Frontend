# NEWS NEXT Frontend

Enterprise-grade frontend starter for NEWS NEXT - Edizione Calabria platform.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **TanStack Query v5**
- **Axios**

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel routes
│   ├── category/          # Category pages
│   ├── news/              # News detail pages
│   └── ...
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components
│   │   └── admin/        # Admin components
│   ├── lib/
│   │   ├── api/          # API client & modules
│   │   ├── hooks/        # TanStack Query hooks
│   │   └── helpers/      # Utility functions
│   ├── providers/        # Context providers
│   └── types/            # TypeScript types
└── public/               # Static assets
```

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration. See `.env.example` for all available variables.

   **Required variables:**

   - `NEXT_PUBLIC_API_URL`: Backend API base URL (must include `/v1` prefix)
   - `NEXT_PUBLIC_FRONTEND_URL`: Frontend base URL for canonical URLs and sitemap

   **Optional variables:**

   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for payments
   - `NEXT_PUBLIC_TINYMCE_API_KEY`: TinyMCE API key for rich text editor
   - `NEXT_PUBLIC_CDN_URL`: CDN URL for images/media
   - Social media URLs and contact information

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

### Public Pages

- **Home Page**: CNN-style layout with hero slider and news grid
- **Category Pages**: Filtered news by category
- **News Detail**: Full article view with related content
- **Search**: Unified search across all content
- **Weather**: Calabria cities weather information
- **Horoscope**: Daily and weekly predictions
- **Transport**: Public transport information
- **TG**: Video news section

### Admin Panel (`/admin/*`)

- **Dashboard**: Statistics and overview
- **News Management**: CRUD operations for news
- **Category Management**: Hierarchical category structure
- **Ads Management**: Advertisement system
- **User Management**: User roles and permissions
- **Settings**: System configuration

## API Integration

The frontend connects to the backend API at `http://localhost:3001/api/v1` (configurable via `NEXT_PUBLIC_API_URL`).

### API Client

- Automatic token injection from localStorage
- Unified error handling
- Request/response interceptors

### TanStack Query Hooks

- `useNews()` - Fetch and manage news
- `useCategories()` - Fetch and manage categories
- `useAds()` - Fetch and manage ads
- `useUsers()` - Fetch and manage users

## Components

### UI Components

- `Navbar` - Main navigation
- `Footer` - Site footer
- `NewsCard` - News article card
- `HeroSlider` - Featured news slider
- `CategoryMenu` - Category navigation
- `Loading` - Loading spinner

### Admin Components

- `AdminSidebar` - Admin navigation sidebar
- `AdminNavbar` - Admin top bar
- `StatsCard` - Statistics display card

## Development

### Build for production:

```bash
npm run build
```

### Start production server:

```bash
npm start
```

### Lint:

```bash
npm run lint
```

### Fix linting issues:

```bash
npm run lint:fix
```

### Type check:

```bash
npm run type-check
```

### Validate before build:

```bash
npm run validate
```

This runs both type checking and linting.

### Full build validation:

```bash
npm run validate-build
```

This runs comprehensive validation including:

- TypeScript type checking
- ESLint validation
- Environment variable validation
- Common issue checks

## Environment Variables

All environment variables are validated at build time. See `.env.example` for a complete list of available variables.

### Required Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend base URL

### Optional Variables

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For payment features
- `NEXT_PUBLIC_TINYMCE_API_KEY` - For rich text editor
- `NEXT_PUBLIC_CDN_URL` - For image/media CDN
- Social media URLs and contact information

## Build Process

The build process includes automatic validation via `prebuild` hook:

1. TypeScript type checking (`tsc --noEmit`)
2. ESLint validation (`eslint .`)
3. Environment variable validation (checks for required variables)
4. Common issue checks

If any validation fails, the build will be aborted with helpful error messages.

**Note:** The `prebuild` hook runs `validate-build` which performs all checks. You can also run validation manually:

```bash
npm run validate-build
```

## Troubleshooting

### Build Errors

1. **TypeScript errors**: Run `npm run type-check` to see detailed type errors
2. **ESLint errors**: Run `npm run lint` to see linting issues
3. **Missing environment variables**: Check `.env` and ensure all required variables are set

### Common Issues

- **Hydration mismatch**: Ensure all client-side only code is wrapped in `useEffect` or uses `useState` initializers
- **Image optimization errors**: Localhost images are automatically unoptimized in development
- **API connection errors**: Ensure the backend server is running on the configured port

## Notes

- All API calls are handled through the centralized API client
- Authentication tokens are stored in localStorage
- TanStack Query handles caching and state management
- Components are organized by feature and type
- TypeScript ensures type safety throughout
- Error boundaries catch and display errors gracefully
- Environment variables are validated at build time
