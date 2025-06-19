# Better Auth Next.js Demo

A simple authentication demo showcasing [Better Auth](https://www.better-auth.com) with Next.js 15 and Prisma. This project demonstrates the core concepts discussed in **"To Auth or not to Auth"** - showing how modern authentication solutions can bridge the gap between custom implementations and auth providers.

## ✨ Core Features

- 🔐 **Email & Password Authentication** - Essential auth functionality
- 🔄 **Session Management** - Server-side sessions with automatic handling
- 🚪 **Route Protection** - Middleware-based protection
- 📊 **Type Safety** - Full TypeScript integration
- 🎨 **Clean UI** - Simple, focused components

## 🎯 Purpose

This repository demonstrates:

- **ORM-first authentication** - Direct Prisma integration
- **Server-side security** - Leveraging Next.js's server features
- **Minimal setup** - Essential code only, no bloat
- **Modern patterns** - 2025 authentication best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended)

### Setup

```bash
git clone <your-repo>
cd better-auth-nextjs-demo
pnpm install
```

### Environment

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Generate auth secret:

```bash
openssl rand -base64 32
```

### Database

Choose your preferred option:

**Supabase (Free):**

1. Create account at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Update `DATABASE_URL` in `.env.local`

**Local Docker:**

```bash
docker-compose up -d
```

### Initialize

```bash
pnpx prisma generate
pnpx prisma db push
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/[...all]/route.ts  # Better Auth API endpoint
│   ├── dashboard/page.tsx          # Protected route example
│   ├── sign-in/page.tsx           # Authentication pages
│   └── sign-up/page.tsx
├── components/auth/               # Auth form components
├── lib/
│   ├── auth.ts                    # Server auth config
│   ├── auth-client.ts             # Client auth hooks
│   └── validations.ts             # Form validation schemas
└── middleware.ts                   # Route protection
```

## 🔧 Key Files

### `src/lib/auth.ts` - Server Configuration

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### `middleware.ts` - Route Protection

- Protects authenticated routes
- Redirects based on auth status
- Type-safe session handling

### Authentication Flow

1. **Registration** - Validate → Create account → Redirect
2. **Login** - Validate → Create session → Redirect
3. **Protection** - Middleware checks → Allow/redirect

## 🚢 Deployment

```bash
pnpm build
pnpx prisma migrate deploy
```

Deploy to Vercel, Netlify, or your preferred platform.

## 💡 Article Context

This demo supports the concepts in **"To Auth or not to Auth"**:

- **Modern Solutions** - Better Auth as middleware between custom and providers
- **ORM Integration** - Direct database control with type safety
- **Server-first** - Leveraging Next.js's server capabilities
- **Practical Trade-offs** - Real-world authentication decisions

## 📚 Learn More

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Authentication Guide](https://nextjs.org/docs/pages/guides/authentication)

## 📄 License

MIT License - perfect for learning and experimentation!
