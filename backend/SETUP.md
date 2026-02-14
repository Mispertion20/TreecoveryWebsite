# Database Setup Guide

This guide walks you through setting up the Treecovery database on Supabase.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created
3. PostGIS extension enabled (usually enabled by default in Supabase)

## Step 1: Enable PostGIS Extension

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Search for "postgis" and click **Enable** if not already enabled
4. Alternatively, run this SQL in the SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

## Step 2: Run Migrations

Run the migration files in order using the Supabase SQL Editor:

### Migration 1: Initial Schema
1. Open **SQL Editor** in Supabase dashboard
2. Copy and paste the contents of `backend/src/database/migrations/001_initial_schema.sql`
3. Click **Run** (or press Ctrl+Enter)
4. Verify success - you should see "Success. No rows returned"

### Migration 2: Functions and Triggers
1. Copy and paste the contents of `backend/src/database/migrations/002_functions_and_triggers.sql`
2. Click **Run**
3. Verify success

### Migration 3: RLS Policies
1. Copy and paste the contents of `backend/src/database/migrations/003_rls_policies.sql`
2. Click **Run**
3. Verify success

## Step 3: Seed Initial Data

1. Copy and paste the contents of `backend/src/database/seed.sql`
2. Click **Run**
3. Verify that data was inserted:
   ```sql
   SELECT COUNT(*) FROM cities; -- Should return 2
   SELECT COUNT(*) FROM districts; -- Should return 6
   SELECT COUNT(*) FROM users; -- Should return 4
   ```

## Step 4: Update User Passwords

⚠️ **Important**: The seed data includes placeholder password hashes. You need to generate real bcrypt hashes.

### Option 1: Using Node.js

Create a temporary script to generate password hashes:

```javascript
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'Test123!'; // Change this to your desired password
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
}

generateHash();
```

Then update the users table:

```sql
UPDATE users 
SET password_hash = 'your-generated-hash-here' 
WHERE email = 'admin@treecovery.kz';
```

### Option 2: Using Online Tool

Use a bcrypt hash generator (for development only):
- https://bcrypt-generator.com/
- Use 10 rounds
- Update the users table with the generated hash

### Option 3: Use Supabase Auth (Recommended)

If you're using Supabase Auth instead of custom authentication:
1. Go to **Authentication** → **Users** in Supabase dashboard
2. Create users manually through the UI
3. Skip the password_hash column (handled by Supabase Auth)

## Step 5: Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check PostGIS is enabled
SELECT PostGIS_version();

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check cities are seeded
SELECT id, name_en, center_lat, center_lng FROM cities;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'cities', 'districts', 'green_spaces', 'photos', 'audit_log');

-- Check indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env` (if using backend code)
2. Get your Supabase credentials:
   - Go to **Settings** → **API**
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **anon public** key → `SUPABASE_ANON_KEY`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

3. Update `.env`:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Troubleshooting

### Error: "relation cities does not exist"
- Make sure you ran migrations in order (001, 002, 003)
- Check that Migration 001 completed successfully

### Error: "extension postgis does not exist"
- Enable PostGIS extension in Supabase dashboard
- Or run: `CREATE EXTENSION IF NOT EXISTS postgis;`

### Error: "permission denied" when running migrations
- Make sure you're using the SQL Editor (not a restricted user)
- Check that you have admin access to the project

### RLS policies blocking queries
- For development, you can temporarily disable RLS:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```
- Remember to re-enable it: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

### Seed data not inserting
- Check for foreign key constraints (cities must exist before districts/users)
- Verify UUIDs match between seed data and actual IDs
- Check for duplicate key errors (use `ON CONFLICT DO NOTHING`)

## Next Steps

After completing the database setup:

1. ✅ Database schema created
2. ✅ PostGIS enabled
3. ✅ RLS policies configured
4. ✅ Seed data loaded
5. ⏭️ Proceed to Task 2: Authentication System

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [PostgreSQL UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html)

