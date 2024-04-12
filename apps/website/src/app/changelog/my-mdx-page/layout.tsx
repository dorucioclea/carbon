import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-[900px] my-24 text-xl space-y-8">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="mx-auto text-3xl font-semibold tracking-tight leading-tighter sm:text-2xl lg:text-4xl">
          Changelog
        </h1>
        <p className="text-muted-foreground">
          Updates and improvements to Carbon
        </p>
      </div>
      <div className="flex gap-12 ">
        <Link href={"/changelog"} className="text-muted-foreground">
          <BsArrowLeft className="inline-block mr-2 " />
          All posts
        </Link>
        <div className="">{children}</div>
      </div>
    </div>
  );
}
