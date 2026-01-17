# Deploy ThodiBaat to Production

## Prerequisites

1. **GitHub Account**: Push this code to a GitHub repository.
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3. **PostgreSQL Database**: Use Vercel Postgres, Supabase, or Neon for a production-ready SQL database.

## 1. Database Setup (e.g., Vercel Postgres)

1. Create a storage instance on Vercel or Supabase.
2. Get the connection string (e.g., `postgres://...`).
3. Update `prisma/schema.prisma` provider to `"postgresql"` if deploying to a non-file-based environment like Vercel Serverless.
   - *Note*: The current code is set to `"sqlite"` for local development. For production using Vercel, change `provider` to `"postgresql"`.

## 2. Environment Variables

Add these to Vercel Project Settings:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="your-secure-random-string"
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
```

## 3. Vercel Deployment

1. Go to Vercel Dashboard -> **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In **Configure Project**:
   - Framework Preset: **Next.js**.
   - **Environment Variables**: Add the ones from step 2.
   - **Build Command**: `npx prisma generate && next build` (Usually Vercel detects this, or add `postinstall` script).
4. Click **Deploy**.

## 4. Post-Deployment

- The Prisma Client will automatically connect using `DATABASE_URL`.
- The database schema will be pushed automatically if you use `npx prisma db push` in your build flow or manually run it.

## Features Checklist

- [x] Landing Page
- [x] Authentication (Signup/Login)
- [x] Dashboard (Protected)
- [x] Database Connection (Prisma ORM)
- [x] API Routes (/api/v1)
- [x] Dark Mode

