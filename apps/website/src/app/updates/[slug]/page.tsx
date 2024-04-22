import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { Tag } from "~/components/Tag";
import { getBlogPosts } from "~/lib/blog";

export default function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = getBlogPosts().find((post) => post.slug === slug);
  if (!post) {
    throw new Error("Post not found");
  }
  return (
    <div className="container my-24 flex gap-12 flex-col items-center">
      {post && (
        <article className="prose dark:prose-invert">
          <Tag status={post.metadata.tag} />
          <h2 className="font-medium md:text-3xl text-2xl">
            {post.metadata.title}
          </h2>
          {post.metadata.image ? (
            post.metadata.link ? (
              <Link href={post.metadata.link}>
                <Image
                  src={post.metadata.image}
                  alt={post.metadata.title}
                  width={680}
                  height={442}
                  className="my-8"
                />
              </Link>
            ) : (
              <Image
                src={post.metadata.image}
                alt={post.metadata.title}
                width={680}
                height={442}
                className="my-8"
              />
            )
          ) : null}
          <MDXRemote source={post.content} />
        </article>
      )}
      <Link href={"/updates"} className="text-muted-foreground">
        <BsArrowLeft className="inline-block mr-2 " />
        All posts
      </Link>
    </div>
  );
}
