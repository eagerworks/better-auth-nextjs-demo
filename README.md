# Better Auth Next.js Demo

A comprehensive authentication demo showcasing [Better Auth](https://www.better-auth.com) with Next.js 15 and Prisma. This project demonstrates modern authentication patterns using a **simple car collection example** to show how Better Auth handles multi-tenant data, 2FA, and organization management.

## ✨ Core Authentication Features

- 🔐 **Email & Password Authentication** - Essential auth functionality
- 🔄 **Session Management** - Server-side sessions with automatic handling
- 🚪 **Route Protection** - Middleware-based protection
- 📊 **Type Safety** - Full TypeScript integration
- 🎨 **Clean UI** - Modern, responsive components
- 🔗 **Social Authentication** - GitHub OAuth integration
- 🔑 **Password Management** - Set password for OAuth users

## 🏢 Organization Plugin Integration

This demo showcases Better Auth's **Organization plugin** with multi-tenant architecture:

- **Plugin-based Architecture** - Added with a single import and configuration
- **Database Schema Generation** - Prisma integration handled automatically
- **Organization Context** - User sessions include active organization data
- **Data Isolation** - Server-side filtering ensures organization data separation
- **Member Management** - Invite members with different roles (owner, admin, member)
- **Organization Switching** - Users can switch between organizations seamlessly

## 🔒 Two-Factor Authentication (2FA)

Enterprise-grade **Two-Factor Authentication (2FA)** powered by Better Auth's built-in TOTP support:

- **TOTP Integration** - Compatible with Google Authenticator, Authy, and other TOTP apps
- **Backup Codes** - Recovery codes for account access if device is lost
- **User-friendly Setup** - QR code generation and step-by-step verification
- **Session Security** - Enhanced protection for sensitive operations
- **Easy Management** - Enable/disable 2FA with password confirmation

## 🚗 Example Domain: Car Collection

A simple **car collection example** to demonstrate real-world multi-tenant patterns:

- **Basic CRUD Operations** - Add, edit, delete cars with form validation
- **Hierarchical Data** - Brands → Models → Cars structure
- **Organization Scoping** - Data properly isolated by organization
- **Brand Assignment** - Assign shared brands to specific organizations
- **Real-time Updates** - Server actions with instant UI updates

This example showcases how Better Auth's organization plugin enables proper data isolation in multi-tenant applications.

## 🔧 Technical Implementation

- **Server Actions** - All mutations through secure server actions
- **Session Validation** - Every action validates user session
- **Type Safety** - End-to-end TypeScript with Prisma types
- **Form Validation** - Comprehensive Zod schemas
- **Error Handling** - Proper error states and user feedback

## 🎯 Purpose

This repository demonstrates:

- **Production-Ready Authentication** - Complete auth system with enterprise features
- **Multi-Tenant Architecture** - Proper data isolation and organization management
- **Modern Full-Stack Development** - Next.js 15, Prisma, TypeScript best practices
- **Security Best Practices** - 2FA, session management, data validation

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

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
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
pnpm run db:seed  # Optional: add sample data
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/[...all]/route.ts  # Better Auth API endpoint
│   ├── dashboard/page.tsx          # Main dashboard with examples
│   ├── sign-in/page.tsx           # Authentication pages
│   └── sign-up/page.tsx
├── components/
│   ├── auth/                      # Authentication components
│   │   ├── organization-settings.tsx  # Organization management
│   │   ├── two-factor-settings.tsx    # 2FA setup/management
│   │   └── set-password-form.tsx      # Password setting for OAuth
│   ├── cars/                      # Example domain components
│   │   ├── add-car-form.tsx          # CRUD form examples
│   │   ├── edit-car-dialog.tsx       # Modal examples
│   │   └── assign-brand-form.tsx     # Multi-tenant examples
│   └── ui/                        # Reusable UI components
├── lib/
│   ├── auth.ts                    # Server auth config with plugins
│   ├── actions.ts                 # Server actions for all operations
│   ├── data.ts                    # Database queries with org context
│   ├── validations.ts             # Zod schemas for forms
│   └── types.ts                   # TypeScript type definitions
└── middleware.ts                   # Route protection
```

## 🔧 Key Implementation Details

### Authentication Configuration

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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    twoFactor({
      issuer: "Better Auth Demo",
      totpOptions: {
        period: 30,
        digits: 6,
      },
    }),
    organization({
      async sendInvitationEmail(data) {
        // Custom email sending logic
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### Multi-Tenant Data Access

```typescript
// All queries respect organization context
export async function getCars(organizationId?: string | null) {
  return await prisma.car.findMany({
    where: {
      organizationId: organizationId || null,
    },
    include: {
      model: { include: { brand: true } },
      organization: true,
    },
  });
}
```

### Better Auth Client Methods (Recommended)

For authentication operations, use Better Auth's secure client methods instead of custom server actions:

```typescript
// auth-client.ts - Export only methods that are actually used
export const twoFactor = {
  enable: authClient.twoFactor.enable,
  disable: authClient.twoFactor.disable,
  verifyTotp: authClient.twoFactor.verifyTotp,
};

export const organization = {
  create: authClient.organization.create,
  setActive: authClient.organization.setActive,
  inviteMember: authClient.organization.inviteMember,
};
```

**Pattern 1: Try-Catch (when you don't need response data)**

```typescript
const handleCreateOrganization = async (formData: FormData) => {
  setIsLoading(true);
  try {
    await organization.create({ name, slug });
    toast.success("Organization created successfully!");
    router.refresh();
  } catch (error: any) {
    toast.error(error.message || "Failed to create organization");
  } finally {
    setIsLoading(false);
  }
};
```

**Pattern 2: { data, error } (when you need response data)**

```typescript
const handleEnable2FA = async (password: string) => {
  try {
    const { data, error } = await twoFactor.enable({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    // Use the data
    setQrCodeUri(data.totpURI);
    setBackupCodes(data.backupCodes);
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

**Benefits:**

- ✅ Built-in CSRF protection
- ✅ Secure cookie management
- ✅ Proper session validation
- ✅ Rate limiting and security headers
- ✅ Cleaner code with better error handling

### Server Actions with Validation

For non-auth operations, continue using server actions:

```typescript
export async function addCarAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Session validation
  await validateSession();

  // Zod validation
  const validationResult = addCarSchema.safeParse(data);

  // Database operation
  const car = await createCar(validationResult.data);

  // UI revalidation
  revalidatePath("/dashboard");

  return { success: true, data: car };
}
```

## 🚢 Deployment

```bash
pnpm build
pnpx prisma migrate deploy
```

Deploy to Vercel, Netlify, or your preferred platform. Make sure to set all environment variables in your deployment platform.

## 💡 What This Demo Shows

- **Modern Authentication** - Better Auth as a complete auth solution
- **Multi-Tenant Patterns** - How to properly isolate data by organization
- **Server-first Architecture** - Leveraging Next.js 15's server capabilities
- **Type Safety** - End-to-end TypeScript with Better Auth + Prisma
- **Enterprise Features** - 2FA, organizations, member management made simple

## 📚 Learn More

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- [Better Auth 2FA Plugin](https://www.better-auth.com/docs/plugins/two-factor)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 📄 License

MIT License - perfect for learning and experimentation!
