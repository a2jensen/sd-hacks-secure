"use client";

import Link from "next/link";

export function ReportButton() {
  return (
    <Link
      href="/report"
      className="fixed bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-ucsd-gold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </Link>
  );
}
