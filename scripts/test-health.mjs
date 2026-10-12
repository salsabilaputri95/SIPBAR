import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkHealth() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    console.log(`✅ Database Health Check: UP (Latency: ${latency}ms)`);
  } catch (err) {
    console.error("❌ Database Health Check Failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkHealth();
