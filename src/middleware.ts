import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getRedirectUrl(path: string, req: NextRequest): URL {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";

  let origin = "";
  if (forwardedHost) {
    origin = `${forwardedProto}://${forwardedHost}`;
  } else if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost") && !process.env.NEXTAUTH_URL.includes("127.0.0.1")) {
    origin = process.env.NEXTAUTH_URL.replace(/\/$/, "");
  } else {
    const host = req.headers.get("host");
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      origin = `https://${host}`;
    } else {
      origin = "https://canned-mashing-crimp.ngrok-free.dev";
    }
  }

  return new URL(path, origin);
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!token;
  const userRole = token?.role;

  // 1. Proteksi rute khusus SUPER_ADMIN (/pengaturan/users, dll)
  if (pathname.startsWith("/pengaturan/users")) {
    if (!isAuthenticated) {
      const loginUrl = getRedirectUrl("/login", req);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "SUPER_ADMIN") {
      // Admin Gudang atau Pegawai tidak boleh mengelola user
      return NextResponse.redirect(getRedirectUrl("/dashboard?error=unauthorized", req));
    }

    return NextResponse.next();
  }

  // 3. Proteksi rute Admin & Transaksi (/dashboard, /inventaris, /transaksi-masuk, /transaksi-keluar, /laporan, /tanda-terima)
  const adminRoutes = [
    "/dashboard",
    "/inventaris",
    "/transaksi-masuk",
    "/transaksi-keluar",
    "/laporan",
    "/tanda-terima",
    "/pengaturan",
  ];

  const isProtectedAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = getRedirectUrl("/login", req);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role PEGAWAI dialihkan ke Dashboard Pegawai mandiri
    if (userRole === "PEGAWAI") {
      return NextResponse.redirect(getRedirectUrl("/pegawai", req));
    }

    return NextResponse.next();
  }

  // 4. Proteksi rute Dashboard Pegawai (/pegawai)
  if (pathname.startsWith("/pegawai")) {
    if (!isAuthenticated) {
      const loginUrl = getRedirectUrl("/login", req);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventaris/:path*",
    "/transaksi-masuk/:path*",
    "/transaksi-keluar/:path*",
    "/laporan/:path*",
    "/tanda-terima/:path*",
    "/pengaturan/:path*",
    "/pegawai/:path*",
  ],
};
