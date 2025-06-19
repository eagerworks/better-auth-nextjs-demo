# 🚀 Supabase Setup Guide

Quick setup guide for using Supabase as your PostgreSQL database with Better Auth.

## Why Supabase?

- ✅ **Free Tier**: 500MB storage, unlimited API requests
- ✅ **Managed PostgreSQL**: No server maintenance required
- ✅ **Dashboard**: Beautiful database management interface
- ✅ **Real-time**: Built-in real-time subscriptions (optional)

## Quick Setup (5 minutes)

### 1. Create Account & Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New project"
3. Fill in project details:
   - **Name**: `better-auth-demo`
   - **Database Password**: Generate secure password (save it!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait 2-3 minutes

### 2. Get Connection String

1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **URI** format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### 3. Update Environment

Add to your `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### 4. Initialize Database

```bash
pnpx prisma generate
pnpx prisma db push
```

### 5. Verify Setup

1. Go to Supabase dashboard → **Table Editor**
2. You should see Better Auth tables:
   - `user`, `session`, `account`, `verification`

## Dashboard Features

- **Table Editor**: View/edit data directly
- **SQL Editor**: Run custom queries
- **Logs**: Monitor database activity
- **API Docs**: Auto-generated REST/GraphQL docs

## Production Tips

- Enable Row Level Security (RLS) for enhanced security
- Use connection pooling for high traffic
- Consider upgrading to Pro ($25/month) for more storage
- Set up regular backups (included in Pro)

## Troubleshooting

**Connection Issues:**

- Double-check password in connection string
- Ensure project is fully initialized (green status)
- Verify no extra spaces in `.env.local`

**Schema Issues:**

- Run `pnpx prisma db push` to sync changes
- Check Supabase logs for detailed errors

## Alternative Options

If Supabase doesn't work for you:

- **[Neon](https://neon.tech)** - Serverless PostgreSQL
- **[Railway](https://railway.app)** - Simple deployment platform
- **Local Docker** - Use included `docker-compose.yml`

---

Need help? Check [Supabase docs](https://supabase.com/docs) or create an issue.
