// fix-package-json.cjs
// Writes a clean, valid package.json with UTF-8 encoding.

const fs = require("fs");

const pkg = {
  name: "vidal-bar-genius",
  private: true,
  version: "1.0.0",
  prisma: { schema: "prisma/schema.prisma" },
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    postinstall: "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  },
  dependencies: {
    "@prisma/client": "^5.22.0",
    "date-fns": "^3.6.0",
    nanoid: "^5.0.7",
    next: "^15.0.0",
    prisma: "^5.22.0",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    stripe: "^16.12.0",
    zod: "^3.23.8"
  },
  devDependencies: {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    eslint: "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "ts-node": "^10.9.2",
    typescript: "^5.6.2"
  }
};

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("✅ Wrote clean package.json");