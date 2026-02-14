# Treecovery Backend API

Express.js backend server for the Treecovery application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

3. Update `.env` with your values:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
- `JWT_SECRET`: A secure random string (minimum 32 characters)
- `JWT_REFRESH_SECRET`: Another secure random string (minimum 32 characters)

## Running

Development mode (with hot reload):
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user (requires authentication)

## Environment Variables

See `.env.example` for all required environment variables.

## Database

Make sure you've run the database migrations from `src/database/migrations/` in your Supabase project.
