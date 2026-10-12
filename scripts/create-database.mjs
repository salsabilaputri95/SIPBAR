import { PrismaClient } from "@prisma/client";

async function main() {
  const adminClient = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:postgres@localhost:5432/postgres?schema=public",
      },
    },
  });

  try {
    console.log("Checking if sipbardb exists...");
    const dbs = await adminClient.$queryRawUnsafe(
      "SELECT 1 FROM pg_database WHERE datname = 'sipbardb'"
    );
    if (Array.isArray(dbs) && dbs.length > 0) {
      console.log("Database 'sipbardb' already exists.");
    } else {
      console.log("Creating database 'sipbardb'...");
      await adminClient.$executeRawUnsafe("CREATE DATABASE sipbardb");
      console.log("Database 'sipbardb' created successfully.");
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await adminClient.$disconnect();
  }
}

main();
