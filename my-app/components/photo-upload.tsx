"use client";

import { useRef } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  file: File | null;
  onFileChange: (file: File) => void;
}

export function PhotoUpload({ file, onFileChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      {file ? (
        <div className="relative h-64 w-full overflow-hidden rounded-lg">
          <Image
            src={URL.createObjectURL(file)}
            alt="Selected photo"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 text-zinc-500 transition-colors hover:border-ucsd-navy hover:text-ucsd-navy"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="text-sm font-medium">Upload a photo</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />

      {file && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm text-ucsd-navy underline"
        >
          Choose a different photo
        </button>
      )}
    </div>
  );
}
