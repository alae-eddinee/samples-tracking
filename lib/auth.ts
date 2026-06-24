import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./mongodb";
import User from "./models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[auth] Missing credentials");
          return null;
        }

        try {
          await connectDB();
        } catch (err) {
          console.error("[auth] DB connection failed:", err);
          return null;
        }

        let user;
        try {
          user = await User.findOne({ email: credentials.email.toLowerCase(), active: true });
        } catch (err) {
          console.error("[auth] User query failed:", err);
          return null;
        }

        if (!user) {
          console.error("[auth] No active user found for:", credentials.email.toLowerCase());
          return null;
        }

        let valid = false;
        try {
          valid = await bcrypt.compare(credentials.password, user.password as string);
        } catch (err) {
          console.error("[auth] bcrypt.compare failed:", err);
          return null;
        }

        if (!valid) {
          console.error("[auth] Password mismatch for:", credentials.email.toLowerCase());
          return null;
        }

        return {
          id: (user._id as { toString(): string }).toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
