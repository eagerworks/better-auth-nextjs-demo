import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor, organization } from "better-auth/plugins";
import { prisma } from "./data";

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
        // In a real app, you'd send an email here
        console.log("Sending invitation email to:", data.email);
        console.log("Organization:", data.organization.name);
        console.log("Invitation:", data.invitation);
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"
      : "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
