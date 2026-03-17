import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      // Auto-register user on first login
      const existing = getUserByEmail(user.email);
      if (!existing) {
        createUser({
          email: user.email,
          name: user.name || "",
          image: user.image || "",
        });
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = getUserByEmail(session.user.email);
        if (dbUser) {
          /* eslint-disable @typescript-eslint/no-explicit-any */
          (session.user as any).role = dbUser.role;
          (session.user as any).groups = dbUser.groups;
          (session.user as any).id = dbUser.id;
          (session.user as any).active = dbUser.active;
          /* eslint-enable @typescript-eslint/no-explicit-any */
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: true,
});
