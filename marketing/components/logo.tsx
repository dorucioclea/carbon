import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="cursor-pointer">
      <div className="flex items-center justify-center gap-2.5">
        <div className="inline-flex items-start justify-start shadow">
          <div className="relative h-8 w-8 rounded-lg border border-zinc-300 bg-gradient-to-b from-white to-zinc-300">
            <div className="absolute left-0 top-0 h-8 w-8"></div>
            <div className="absolute left-[8px] top-[8px] h-4 w-4 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 shadow"></div>
            <div className="absolute left-0 top-[16px] h-4 w-8 rounded-bl-lg rounded-br-lg bg-opacity-20 backdrop-blur-[5px]"></div>
          </div>
        </div>
        <span className="font-semibold text-2xl">carbon</span>
      </div>
    </Link>
  );
}
