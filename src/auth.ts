import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        const googleId = account.providerAccountId;
        const user = await prisma.user.upsert({
          where: { googleId },
          update: {
            email: profile?.email ?? undefined,
            name: profile?.name ?? undefined,
            image: (profile as { picture?: string } | undefined)?.picture,
          },
          create: {
            googleId,
            email: profile?.email ?? undefined,
            name: profile?.name ?? undefined,
            image: (profile as { picture?: string } | undefined)?.picture,
          },
        });
        token.userId = user.id;

        return token;
      }

      if (
        typeof token.expiresAt === "number" &&
        Date.now() < token.expiresAt * 1000
      ) {
        return token;
      }

      if (!token.refreshToken) return token;

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
        });
        const refreshed = await response.json();
        if (!response.ok) throw refreshed;

        token.accessToken = refreshed.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000 + refreshed.expires_in);
        token.refreshToken = refreshed.refresh_token ?? token.refreshToken;
      } catch (error) {
        console.error("Error refrescando el token de Google", error);
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
