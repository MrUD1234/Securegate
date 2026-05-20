import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { LoginSchema } from "./schemas";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sessionVersion = (user as any).sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { sessionVersion: true },
        });
        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
          return null as any;
        }
        session.user.id = token.sub;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await db.user.findUnique({
            where: { email }
          });

          if (!user || !user.password) {
            await bcrypt.compare("dummy", "$2b$12$00000000000000000000000000000000000");
            return null;
          }

          if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(
            password,
            user.password
          );

          if (passwordsMatch) return user;
        }

        return null;
      }
    })
  ],
});
