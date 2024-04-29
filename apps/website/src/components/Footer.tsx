"use client";
import { Toaster } from "@carbon/react";
import Link from "next/link";

export function Footer() {
  return (
    <div className="h-32 py-12 flex">
      <div className="w-full justify-center items-center gap-8 flex text-foreground font-semibold">
        <Link href="/story">Story</Link>
        <Link href="/updates">Updates</Link>
        <Link href="https://git.new/carbon">Github</Link>
        <Link href="https://docs.crbnerp.com">Docs</Link>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
