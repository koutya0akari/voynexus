import { createHash } from "node:crypto";
import NextAuth from "next-auth";
import { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? process.env.MEMBERSHIP_TOKEN_SECRET;
const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const derivedSecret =
  !nextAuthSecret && hasGoogleCredentials
    ? createHash("sha256")
        .update(`${process.env.GOOGLE_CLIENT_ID}:${process.env.GOOGLE_CLIENT_SECRET}`)
        .digest("hex")
    : undefined;

const resolvedSecret =
  nextAuthSecret ??
  derivedSecret ??
  (process.env.NODE_ENV === "development" ? "development-nextauth-secret" : undefined);

const authEnabled = Boolean(resolvedSecret && hasGoogleCredentials);

if (!authEnabled) {
  const missing = [
    resolvedSecret ? null : "NEXTAUTH_SECRET (or MEMBERSHIP_TOKEN_SECRET)",
    hasGoogleCredentials ? null : "GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET",
  ]
    .filter(Boolean)
    .join(", ");

  const context: "error" | "warn" = process.env.NODE_ENV === "production" ? "error" : "warn";
  console[context](
    `[auth] NextAuth is disabled because required env vars are missing: ${missing}. Users will see limited auth features.`
  );
} else if (!process.env.NEXTAUTH_SECRET && process.env.MEMBERSHIP_TOKEN_SECRET) {
  console.warn("NEXTAUTH_SECRET is missing; falling back to MEMBERSHIP_TOKEN_SECRET for NextAuth.");
} else if (!process.env.NEXTAUTH_SECRET && derivedSecret) {
  console.warn("NEXTAUTH_SECRET is missing; deriving a secret from the Google OAuth credentials.");
}

export const authOptions: NextAuthOptions | null = authEnabled
  ? {
      session: {
        strategy: "jwt",
      },
      secret: resolvedSecret!,
      providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
      ],
      callbacks: {
        async session({ session, token }: { session: Session; token: JWT }) {
          if (session.user && token.sub) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
    }
  : null;

export const auth = authOptions ? () => getServerSession(authOptions) : async () => null;

const disabledHandler = async () =>
  new Response(JSON.stringify({ error: "Authentication is not configured." }), {
    status: 503,
    headers: { "content-type": "application/json" },
  });

const handler: ReturnType<typeof NextAuth> = authOptions
  ? NextAuth(authOptions)
  : async () => disabledHandler();

export { handler as GET, handler as POST };

export const isAuthEnabled = authEnabled;
