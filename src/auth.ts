import NextAuth from "next-auth";
import { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? process.env.MEMBERSHIP_TOKEN_SECRET;

if (!nextAuthSecret) {
  throw new Error(
    "NEXTAUTH_SECRET is not configured. Set NEXTAUTH_SECRET (or reuse MEMBERSHIP_TOKEN_SECRET) in your deployment environment."
  );
}

if (!process.env.NEXTAUTH_SECRET && process.env.MEMBERSHIP_TOKEN_SECRET) {
  console.warn("NEXTAUTH_SECRET is missing; falling back to MEMBERSHIP_TOKEN_SECRET for NextAuth.");
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: nextAuthSecret,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
};

export const auth = () => getServerSession(authOptions);

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
