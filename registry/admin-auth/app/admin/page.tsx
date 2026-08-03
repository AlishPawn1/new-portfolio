import { auth } from "@/auth";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Welcome, {session?.user?.name ?? session?.user?.email}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Admin dashboard. More sections coming soon.
      </p>
    </div>
  );
}
