import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BsArrowLeft } from "react-icons/bs";
import { getBlogPosts } from "~/lib/blog";
import EmailForm from "~/components/EmailForm";

export default function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = getBlogPosts().find((post) => post.slug === slug);
  if (!post) {
    alert("Post not found");
  }
  return (
    <div className="container  my-12 text-xl space-y-8">
      <div className="my-24 w-fit mx-auto flex flex-col items-start space-y-8">
        <h1 className="text-3xl font-semibold sm:text-2xl lg:text-4xl xl:text-5xl">
          Changelog
        </h1>
        <p className="text-muted-foreground">What&apos;s new in Carbon?</p>
        <EmailForm />
      </div>
      <hr className="my-12 h-0.5 border-t-0 bg-muted-foreground/20" />
      <div className="flex gap-12 ">
        <Link href={"/changelog"} className="text-muted-foreground">
          <BsArrowLeft className="inline-block mr-2 " />
          All posts
        </Link>
        {post && (
          <div className="prose dark:prose-invert">
            <h2 className="font-medium text-3xl mb-6">{post.metadata.title}</h2>
            <MDXRemote source={post.content} />
          </div>
        )}
      </div>
    </div>
  );
}
