import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { getBlogPosts } from "~/lib/blog";
import Image from "next/image";

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
    <div className="container my-24 flex gap-12 flex-col items-center">
      {post && (
        <div className="prose dark:prose-invert">
          <h2 className="font-medium text-3xl mb-6">{post.metadata.title}</h2>
          {post.metadata.image && (
            <Image
              src={post.metadata.image}
              alt={post.metadata.title}
              width={680}
              height={442}
              className="my-8"
            />
          )}
          <MDXRemote source={post.content} />
        </div>
      )}
      <Link href={"/updates"} className="text-muted-foreground">
        <BsArrowLeft className="inline-block mr-2 " />
        All posts
      </Link>
    </div>
  );
}
