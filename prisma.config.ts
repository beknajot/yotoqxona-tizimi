import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migratsiyalar uchun Direct URL ishlatiladi (Port: 5432)
    url: process.env["DIRECT_URL"],
  },
});
