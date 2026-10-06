import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env file.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
