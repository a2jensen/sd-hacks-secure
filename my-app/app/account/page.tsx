"use client";

import { useAuth } from "@/context/auth-context";
import { logOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await logOut();
    router.replace("/sign-in");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="flex flex-col items-center gap-6 rounded-lg border p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ucsd-navy text-2xl font-bold text-white">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="text-center">
          <p className="font-medium">{user?.displayName ?? "UCSD Student"}</p>
          <p className="text-sm text-zinc-500">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
