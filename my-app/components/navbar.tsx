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
    <nav className="relative bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="text-lg font-bold tracking-tight text-ucsd-gradient">
          <span className="hidden sm:inline">UCSD Safety </span>Alerts
        </span>
        <div className="flex gap-0 sm:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-semibold transition-all duration-200 ${
                pathname === link.href
                  ? "bg-ucsd-gradient text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-ucsd-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Gradient accent line */}
      <div className="bg-ucsd-gradient h-0.5" />
    </nav>
  );
}
