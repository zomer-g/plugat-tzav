import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUserByEmail, createUser, updateUser, getSoldiers } from "@/lib/db";

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
        const newUser = createUser({
          email: user.email,
          name: user.name || "",
          image: user.image || "",
        });
        // Auto-assign "soldiers" group if email matches a soldier record
        const soldiers = getSoldiers();
        const matchingSoldier = soldiers.find(
          (s) => s.email?.toLowerCase() === user.email!.toLowerCase()
        );
        if (matchingSoldier && !newUser.groups.includes("soldiers")) {
          updateUser(newUser.id, { groups: [...newUser.groups, "soldiers"] });
        }
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
        let dbUser = getUserByEmail(session.user.email);
        // Auto-recreate user if data was wiped (e.g. Render redeploy)
        if (!dbUser) {
          dbUser = createUser({
            email: session.user.email,
            name: session.user.name || "",
            image: session.user.image || "",
          });
        }
        // Ensure ADMIN_EMAIL is always admin
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
        if (adminEmail && session.user.email.toLowerCase() === adminEmail && dbUser.role !== "admin") {
          dbUser = updateUser(dbUser.id, { role: "admin" }) || dbUser;
        }
        /* eslint-disable @typescript-eslint/no-explicit-any */
        (session.user as any).role = dbUser.role;
        (session.user as any).groups = dbUser.groups;
        (session.user as any).id = dbUser.id;
        (session.user as any).active = dbUser.active;
        (session.user as any).consentVersion = dbUser.consentVersion;
        /* eslint-enable @typescript-eslint/no-explicit-any */
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // refresh every 24 hours
  },
  trustHost: true,
});
