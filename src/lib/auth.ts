import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "SIPBAR Credentials",
      credentials: {
        username: { label: "Username / NIP", type: "text", placeholder: "superadmin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password wajib diisi");
        }

        const usernameOrNip = credentials.username.trim();

        // Cari user berdasarkan username ATAU NIP
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: usernameOrNip },
              { nip: usernameOrNip },
            ],
          },
          include: {
            fungsi: true,
          },
        });

        if (!user) {
          throw new Error("Akun pengguna tidak ditemukan");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password yang Anda masukkan salah");
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          nip: user.nip,
          role: user.role,
          avatar: user.avatar,
          fungsiId: user.fungsiId,
          fungsiNama: user.fungsi?.nama || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.nip = user.nip;
        token.role = user.role;
        token.avatar = user.avatar;
        token.fungsiId = user.fungsiId;
        token.fungsiNama = user.fungsiNama;
      }

      // Handle session update on client side
      if (trigger === "update" && session?.user) {
        token.name = session.user.name || token.name;
        token.avatar = session.user.avatar || token.avatar;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name as string;
        session.user.username = token.username;
        session.user.nip = token.nip;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.fungsiId = token.fungsiId;
        session.user.fungsiNama = token.fungsiNama;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const NGROK_DOMAIN = "https://canned-mashing-crimp.ngrok-free.dev";

      // Abaikan jika process.env.NEXTAUTH_URL atau baseUrl merujuk ke localhost agar tidak terjebak di localhost:3001
      let activeBase = NGROK_DOMAIN;
      if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost") && !process.env.NEXTAUTH_URL.includes("127.0.0.1")) {
        activeBase = process.env.NEXTAUTH_URL.replace(/\/$/, "");
      } else if (baseUrl && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")) {
        activeBase = baseUrl.replace(/\/$/, "");
      }

      // 1. Jika URL relatif (misal "/dashboard", "/pegawai", "/login"), jadikan Absolute URL valid
      if (url.startsWith("/")) {
        return `${activeBase}${url}`;
      }

      // 2. Jika URL sudah absolute (http/https)
      try {
        const urlObj = new URL(url);
        // Jika URL merujuk ke localhost/127.0.0.1, arahkan ke activeBase (ngrok)
        if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
          return `${activeBase}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        }

        if (
          urlObj.hostname.includes("ngrok") ||
          urlObj.hostname.includes("canned-mashing-crimp.ngrok-free.dev") ||
          urlObj.origin === activeBase
        ) {
          return url;
        }
      } catch {
        // Abaikan parsing error
      }

      return activeBase;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
