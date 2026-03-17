import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUserByEmail, createUser, updateUser } from "@/lib/db";

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
      } else {
        // If ADMIN_EMAIL matches, ensure they are admin (handles data resets)
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        if (adminEmail && user.email.toLowerCase() === adminEmail && existing.role !== "admin") {
          updateUser(existing.id, { role: "admin" });
        }
        // Ensure user is active on sign-in
        if (!existing.active) {
          updateUser(existing.id, { active: true });
        }
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
