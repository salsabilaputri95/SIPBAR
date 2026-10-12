import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "UP",
        timestamp: new Date().toISOString(),
        database: "CONNECTED",
        version: "1.0.0",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        timestamp: new Date().toISOString(),
        database: "DISCONNECTED",
        error: error.message || "Database connection error",
      },
      { status: 503 }
    );
  }
}
