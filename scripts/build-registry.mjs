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
  ["app/(admin)/layout.tsx", "~/app/(admin)/layout.tsx"],
  ["app/(admin)/admin/page.tsx", "~/app/(admin)/admin/page.tsx"],
  ["app/(admin)/admin/AdminNav.tsx", "~/app/(admin)/admin/AdminNav.tsx"],
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

// ---------------------------------------------------------------------------
// Date picker registry items (AD + BS variants, installable separately)
// ---------------------------------------------------------------------------
const uiItemDefs = [
  {
    name: "date-picker",
    title: "Date Picker (AD)",
    description:
      "A single date picker (Gregorian/AD) with month navigation and a minimum date option.",
    dependencies: ["lucide-react"],
    files: [["registry/date-picker.tsx", "~/components/ui/date-picker.tsx"]],
    docs: `Usage:

\`\`\`tsx
import { DatePicker } from "@/components/ui/date-picker";

const [date, setDate] = useState(""); // 'YYYY-MM-DD'

<DatePicker value={date} onChange={setDate} min="2024-01-01" />
\`\`\`

Props: value (string, 'YYYY-MM-DD'), onChange, placeholder, min ('YYYY-MM-DD' disables earlier dates), id, className.`,
  },
  {
    name: "date-range-picker",
    title: "Date Range Picker (AD)",
    description:
      "A date range picker (Gregorian/AD) with quick presets, two-month view, hover preview, and a minimum date option.",
    dependencies: ["lucide-react"],
    files: [
      [
        "registry/date-range-picker.tsx",
        "~/components/ui/date-range-picker.tsx",
      ],
    ],
    docs: `Usage:

\`\`\`tsx
import { DateRangePicker } from "@/components/ui/date-range-picker";

const [range, setRange] = useState({ from: "", to: "" });

<DateRangePicker value={range} onChange={setRange} min="2024-01-01" />
\`\`\`

Props: value ({ from, to } as 'YYYY-MM-DD'), onChange, placeholder, min ('YYYY-MM-DD'), id, className.`,
  },
  {
    name: "date-picker-bs",
    title: "Date Picker (BS / Nepali)",
    description:
      "A Nepali Bikram Sambat date picker (AD value in, BS calendar UI) with year/month selectors.",
    dependencies: ["lucide-react", "@remotemerge/nepali-date-converter"],
    files: [
      ["registry/date-picker-bs.tsx", "~/components/ui/date-picker-bs.tsx"],
      ["registry/select.tsx", "~/components/ui/select.tsx"],
      ["registry/lib/nepali.ts", "~/lib/nepali.ts"],
    ],
    docs: `Usage:

\`\`\`tsx
import { DatePicker } from "@/components/ui/date-picker-bs";

const [date, setDate] = useState(""); // AD 'YYYY-MM-DD'

<DatePicker value={date} onChange={setDate} />
\`\`\`

The value stays an AD 'YYYY-MM-DD' string; the calendar renders in Bikram Sambat.
Also installs components/ui/select.tsx and lib/nepali.ts automatically.`,
  },
  {
    name: "date-range-picker-bs",
    title: "Date Range Picker (BS / Nepali)",
    description:
      "A Nepali Bikram Sambat date range picker (AD values in, BS calendar UI) with quick presets and a two-month view.",
    dependencies: ["lucide-react", "@remotemerge/nepali-date-converter"],
    files: [
      [
        "registry/date-range-picker-bs.tsx",
        "~/components/ui/date-range-picker-bs.tsx",
      ],
      ["registry/lib/nepali.ts", "~/lib/nepali.ts"],
    ],
    docs: `Usage:

\`\`\`tsx
import { DateRangePicker } from "@/components/ui/date-range-picker-bs";

const [range, setRange] = useState({ from: "", to: "" });

<DateRangePicker value={range} onChange={setRange} />
\`\`\`

Values stay AD 'YYYY-MM-DD' strings; the calendar renders in Bikram Sambat.
Also installs lib/nepali.ts automatically.`,
  },
];

function mergeCatalogItem(catalogPath, def, catalogItem) {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf-8"));
  catalog.items = [
    ...catalog.items.filter((i) => i.name !== def.name),
    catalogItem,
  ];
  catalog.homepage = homepage;
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
}

for (const def of uiItemDefs) {
  const builtFiles = def.files.map(([srcPath, target]) => ({
    path: target.replace("~/", ""),
    type: "registry:ui",
    target,
    content: readFileSync(join(root, srcPath), "utf-8"),
  }));

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: def.name,
    type: "registry:ui",
    title: def.title,
    description: def.description,
    dependencies: def.dependencies,
    files: builtFiles,
    docs: def.docs,
  };

  writeFileSync(
    join(outDir, `${def.name}.json`),
    JSON.stringify(item, null, 2) + "\n"
  );

  mergeCatalogItem(
    join(outDir, "registry.json"),
    def,
    {
      name: def.name,
      type: "registry:ui",
      title: def.title,
      description: def.description,
      dependencies: def.dependencies,
      files: def.files.map(([srcPath]) => ({
        path: srcPath,
        type: "registry:ui",
      })),
    }
  );

  mergeCatalogItem(
    join(root, "registry.json"),
    def,
    {
      name: def.name,
      type: "registry:ui",
      title: def.title,
      description: def.description,
      dependencies: def.dependencies,
      files: def.files.map(([srcPath]) => srcPath),
    }
  );
}

console.log(
  `Wrote r/date-picker.json, r/date-range-picker.json, r/date-picker-bs.json, r/date-range-picker-bs.json and merged them into r/registry.json + registry.json`
);
