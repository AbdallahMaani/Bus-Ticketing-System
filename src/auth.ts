import NextAuth, { type NextAuthConfig, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

const config = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("No credentials provided");
          return null;
        }

        try {
          console.log(`Attempting login with username: ${credentials.username}`);
          
          // Use fetch with rejectUnauthorized: false for self-signed certs
          const res = await fetch(`${API_URL}/api/User/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            credentials: "include",
          });

          const data = await res.json();
          console.log("Backend login response status:", res.status);
          console.log("Backend login response:", data);

          if (!res.ok) {
            console.error("Login failed with status:", res.status);
            console.error("Error from backend:", data?.message || data?.errorMessage || "Unknown error");
            return null;
          }

          // Backend returns: { accessToken: string, user: AuthUserDto }
          if (data?.accessToken && data?.user) {
            const user = data.user;
            console.log("Login successful, returning user:", user);
            return {
              id: user.id || user.userId,
              name: user.username,
              email: user.email,
              accessToken: data.accessToken,
              fullName: user.fullName,
              role: user.role,
              balance: user.balance || 0,
            };
          }
          
          console.error("Missing accessToken or user in response");
          return null;
        } catch (error) {
          console.error("Auth error during login:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.role = user.role;
        token.balance = user.balance;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).balance = token.balance;
        (session.user as any).fullName = token.fullName;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes (match backend)
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);