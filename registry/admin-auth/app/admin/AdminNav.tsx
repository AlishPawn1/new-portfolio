"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminNav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/admin" className="text-sm font-semibold text-zinc-900">
          Degaina Store Admin
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            View store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
