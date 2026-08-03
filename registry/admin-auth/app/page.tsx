import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-white px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Degaina Store
        </h1>
        <p className="mt-4 max-w-md text-lg text-zinc-500">
          A modern store, coming soon.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
