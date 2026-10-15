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
      // Jika URL callback relatif (/login, /pegawai, /dashboard), kembalikan relatif agar browser tetap berada di domain aktif (misal ngrok)
      if (url.startsWith("/")) return url;
      try {
        const urlObj = new URL(url);
        // Izinkan jika domain tujuan adalah domain ngrok atau sama dengan origin
        if (
          urlObj.hostname.includes("ngrok") ||
          urlObj.hostname.includes("canned-mashing-crimp.ngrok-free.dev") ||
          urlObj.origin === baseUrl
        ) {
          return url;
        }
      } catch {
        // Abaikan parsing error
      }
      return url.startsWith("http") ? url : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
