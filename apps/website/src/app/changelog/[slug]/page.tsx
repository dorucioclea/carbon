import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { getBlogPosts } from "~/lib/blog";
import { ChangelogHeader } from "../page";

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
      <ChangelogHeader />
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
