import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
