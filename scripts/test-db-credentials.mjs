import { PrismaClient } from "@prisma/client";

const passwords = [
  "postgres",
  "admin",
  "root",
  "123456",
  "password",
  "1234",
  "sipbarpassword123",
  "",
];

async function tryPassword(pass) {
  const url = `postgresql://postgres:${encodeURIComponent(pass)}@localhost:5432/postgres?schema=public`;
  const client = new PrismaClient({
    datasources: {
      db: { url },
    },
  });

  try {
    await client.$connect();
    console.log(`✅ Success with password: "${pass}"`);
    await client.$disconnect();
    return true;
  } catch (err) {
    // console.log(`Failed for "${pass}":`, err.message);
    await client.$disconnect().catch(() => {});
    return false;
  }
}

async function main() {
  for (const p of passwords) {
    const ok = await tryPassword(p);
    if (ok) {
      console.log(`FOUND_PASSWORD=${p}`);
      return;
    }
  }
  console.log("No common password matched.");
}

main();
