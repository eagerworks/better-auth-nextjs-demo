import { createAuthClient } from "better-auth/react";
import {
  twoFactorClient,
  organizationClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    twoFactorClient({
      // Redirect to 2FA verification when needed
      onTwoFactorRedirect: () => {
        window.location.href = "/two-factor";
      },
    }),
    organizationClient(),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

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
