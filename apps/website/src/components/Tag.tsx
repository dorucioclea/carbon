"use client";

import { cn } from "@carbon/react";

export function Tag({ status }: { status: string }) {
  return (
    <div
      className={cn(
        "border rounded-md px-2 py-1 inline-block text-[10px] font-medium mb-4 text-foreground border-foreground uppercase",
        status === "Design" && "border-[#ff0000] text-[#ff0000]",
        status === "Engineering" && "border-primary text-primary"
      )}
    >
      {status}
    </div>
  );
}
