import { PrismaClient } from "@prisma/client";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { PrismaPg } from "@prisma/adapter-pg";

export const DB = new SQLDatabase("db", {
  migrations: {
    path: "./migrations",
    source: "prisma",
  },
});
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DB.connectionString }),
});

export { prisma };
