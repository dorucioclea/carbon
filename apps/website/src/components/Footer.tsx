import Link from "next/link";

export function Footer() {
  return (
    <div className="h-32 py-12 flex">
      <div className="w-full justify-center items-center gap-8 flex text-foreground font-semibold">
        <Link href="/story">Story</Link>
        <Link href="/updates">Updates</Link>
        <Link href="https://github.com/barbinbrad/carbon">Github</Link>
      </div>
    </div>
  );
}
