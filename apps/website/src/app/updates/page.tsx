import type { Metadata } from "next";
import Link from "next/link";
import EmailForm from "~/components/EmailForm";

export const metadata: Metadata = {
  title: "Carbon ERP | Story",
};

export default function Page() {
  return (
    <div className="container max-w-[750px] my-24 text-xl space-y-8">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="mx-auto text-3xl font-semibold tracking-tight leading-tighter sm:text-2xl lg:text-4xl xl:text-5xl ">
          Changelog
        </h1>
        <p>New updates and improvemets to Carbon</p>
        <EmailForm />
      </div>
      <div>
        <Link href="/updates/my-mdx-page">My MDX Page</Link>
      </div>
    </div>
  );
}
