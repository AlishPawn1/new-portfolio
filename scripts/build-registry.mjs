import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "r");
mkdirSync(outDir, { recursive: true });

// Change this to wherever you host the registry (used by `shadcn list`/`search`).
const homepage = "https://alishpawn.com.np";

const AUTH_SECRET = "oFMPvlGkAeboJ0zZ69vBFZRTfRw1gbEjkFfaMl5CA2U=";

const ENV_CONTENT = `# Database
DATABASE_URL="postgresql://postgres:StrongPassword%40123@localhost:5432/mydb?schema=public"

# Auth.js (session signing key - regenerate with: npx auth secret)
AUTH_SECRET="${AUTH_SECRET}"

# Admin seed user
ADMIN_EMAIL="admin@degaina.com"
ADMIN_PASSWORD="admin12345"
ADMIN_NAME="Admin"
`;

// registry/admin-auth/<path> -> target in the consumer project
const files = [
  ["auth.ts", "~/auth.ts"],
  ["lib/prisma.ts", "~/lib/prisma.ts"],
  ["types/next-auth.d.ts", "~/types/next-auth.d.ts"],
  ["app/api/auth/[...nextauth]/route.ts", "~/app/api/auth/[...nextauth]/route.ts"],
  ["app/login/page.tsx", "~/app/login/page.tsx"],
  ["app/admin/layout.tsx", "~/app/admin/layout.tsx"],
  ["app/admin/page.tsx", "~/app/admin/page.tsx"],
  ["app/admin/AdminNav.tsx", "~/app/admin/AdminNav.tsx"],
  ["app/page.tsx", "~/app/page.tsx"],
  ["prisma/schema.prisma", "~/prisma/schema.prisma"],
  ["prisma/seed.ts", "~/prisma/seed.ts"],
  ["prisma.config.ts", "~/prisma.config.ts"],
];

const srcRoot = join(root, "registry", "admin-auth");

const builtFiles = files.map(([projectPath, target]) => ({
  path: target.replace("~/", ""),
  type: "registry:file",
  target,
  content: readFileSync(join(srcRoot, projectPath), "utf-8"),
}));

builtFiles.push({
  path: ".env",
  type: "registry:file",
  target: "~/.env",
  content: ENV_CONTENT,
});

const dependencies = [
  "next-auth@beta",
  "@prisma/client",
  "@prisma/adapter-pg",
  "pg",
  "bcryptjs",
];

const devDependencies = ["prisma", "tsx", "dotenv", "@types/pg", "@types/bcryptjs"];

const docs = `Next steps after installation:

1. Review .env (created for you) and update DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD.
2. npx prisma generate
3. npx prisma migrate dev --name init
4. npx prisma db seed
5. npm run dev

Open http://localhost:3000/admin and sign in with ADMIN_EMAIL / ADMIN_PASSWORD.
Routes: /login (sign in), /admin (guarded dashboard).`;

const item = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "admin-auth",
  type: "registry:file",
  title: "NextAuth v5 Admin Auth + Prisma",
  description:
    "Full admin authentication for Next.js App Router: NextAuth v5 credentials, Prisma 7 (PostgreSQL via driver adapter), JWT sessions with isAdmin, guarded /admin routes, login page and admin seed.",
  author: "degaina-store",
  dependencies,
  devDependencies,
  files: builtFiles,
  docs,
};

// Built registry item - this is what the one-line install targets.
writeFileSync(join(outDir, "admin-auth.json"), JSON.stringify(item, null, 2) + "\n");

// Merge admin-auth into the web catalog (r/registry.json).
const webCatalogPath = join(outDir, "registry.json");
const webCatalog = JSON.parse(readFileSync(webCatalogPath, "utf-8"));
const webCatalogItem = {
  name: item.name,
  type: "registry:file",
  title: item.title,
  description: item.description,
  author: item.author,
  dependencies,
  devDependencies,
  files: files.map(([projectPath]) => ({
    path: join("registry", "admin-auth", projectPath).replace(/\\/g, "/"),
    type: "registry:file",
  })),
};
webCatalog.items = [
  ...webCatalog.items.filter((i) => i.name !== item.name),
  webCatalogItem,
];
webCatalog.homepage = homepage;
writeFileSync(webCatalogPath, JSON.stringify(webCatalog, null, 2) + "\n");

// Merge admin-auth into the source catalog (registry.json).
const sourceCatalogPath = join(root, "registry.json");
const sourceCatalog = JSON.parse(readFileSync(sourceCatalogPath, "utf-8"));
const sourceCatalogItem = {
  name: item.name,
  type: "registry:file",
  title: item.title,
  description: item.description,
  author: item.author,
  dependencies,
  devDependencies,
  files: files.map(([projectPath]) =>
    join("registry", "admin-auth", projectPath).replace(/\\/g, "/")
  ),
};
sourceCatalog.items = [
  ...sourceCatalog.items.filter((i) => i.name !== item.name),
  sourceCatalogItem,
];
sourceCatalog.homepage = homepage;
writeFileSync(sourceCatalogPath, JSON.stringify(sourceCatalog, null, 2) + "\n");

console.log(
  `Wrote r/admin-auth.json (${item.files.length} files) and merged admin-auth into r/registry.json + registry.json`
);
