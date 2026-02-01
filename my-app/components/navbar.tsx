"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const links = [
  { href: "/map", label: "Map" },
  { href: "/incidents", label: "Incidents" },
  { href: "/suspects", label: "Suspects" },
  { href: "/account", label: "Account" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="text-lg font-bold text-ucsd-navy">
          UCSD Safety Alerts
        </span>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-ucsd-navy text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
