import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn({ user }) {
      await connectDB();

      let existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        existingUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.email === process.env.ADMIN_EMAIL ? "admin" : "user",
        });
      }
      return true;
    },

    // 🟢 store role in JWT
    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        token.role = dbUser?.role || "user";
        token.id = dbUser?._id.toString();
      }
      return token;
    },

    // 🟢 attach role from token into session
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },

    async redirect({ baseUrl, token }) {
      if (token?.role === "admin") return `${baseUrl}/admin/dashboard`;
      if (token?.role === "user") return `${baseUrl}/user`;
      return baseUrl;
    },
  },
  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
