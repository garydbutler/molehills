import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { SignJWT, jwtVerify } from "jose";

function checkAuthSecrets() {
  const missing: string[] = [];
  if (!process.env.AUTH_SECRET) missing.push("AUTH_SECRET");
  if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
  return missing;
}

export function areAuthSecretsConfigured(): boolean {
  return checkAuthSecrets().length === 0;
}

export function getMissingSecrets(): string[] {
  return checkAuthSecrets();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;
        token.sub = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.provider = token.provider as string;
        session.user.sub = token.sub as string;
      }
      return session;
    },
  },
});

const MOBILE_TOKEN_EXPIRY = "7d";

export async function createMobileToken(user: {
  name?: string | null;
  email?: string | null;
  provider: string;
  sub: string;
}): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not configured");

  const key = new TextEncoder().encode(secret);
  const token = await new SignJWT({
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    provider: user.provider,
    sub: user.sub,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_EXPIRY)
    .sign(key);

  return token;
}

export async function verifyMobileToken(token: string): Promise<{
  name?: string;
  email?: string;
  provider: string;
  sub: string;
} | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return {
      name: payload.name as string | undefined,
      email: payload.email as string | undefined,
      provider: payload.provider as string,
      sub: payload.sub as string,
    };
  } catch {
    return null;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
      sub?: string;
    };
  }
}
