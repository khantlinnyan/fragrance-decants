// /home/linxnext/Documents/fragrance-decants/backend/prisma/database.ts

// CHANGE THIS LINE:
// import { PrismaClient } from "@prisma/client";

// TO A RELATIVE PATH POINTING TO THE GENERATED FILE LOCATION:
// Since database.ts is in 'backend/prisma', and the client is generated to
// 'backend/prisma/generated', the import should be relative.
import { PrismaClient } from "./generated/client"; // This points to the main entry point file

import { SQLDatabase } from "encore.dev/storage/sqldb";
import { PrismaPg } from "@prisma/adapter-pg";

export const db = new SQLDatabase("db", {
  migrations: {
    path: "./migrations",
    source: "prisma",
  },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: db.connectionString }),
});

export { prisma };
