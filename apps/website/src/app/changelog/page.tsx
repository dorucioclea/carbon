import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import EmailForm from "~/components/EmailForm";
import { getBlogPosts } from "~/lib/blog";

export const metadata: Metadata = {
  title: "Carbon ERP | Story",
};

export function ChangelogHeader() {
  return (
    <>
      <div className="my-24 w-fit mx-auto flex flex-col items-start space-y-8">
        <h1 className="text-3xl font-semibold sm:text-2xl lg:text-4xl xl:text-5xl">
          Changelog
        </h1>
        <p className="text-muted-foreground">What&apos;s new in Carbon?</p>
        <EmailForm />
      </div>
      <hr className="my-12 h-0.5 border-t-0 bg-muted-foreground/20 " />
    </>
  );
}

export default function Page() {
  const data = getBlogPosts();
  const posts = data
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    })
    .map((post, index) => (
      <Article key={post.slug} data={post} firstPost={index === 0} />
    ));

  return (
    <div className="container text-xl space-y-8">
      <ChangelogHeader />
      <div>{posts}</div>
    </div>
  );
}

type ArticleProps = {
  firstPost: boolean;
  data: {
    slug: string;
    metadata: {
      tag: string;
      title: string;
      image?: string;
      publishedAt?: string;
    };
    content: string;
  };
};

export function Article({ data }: ArticleProps) {
  const formattedDate = data?.metadata?.publishedAt
    ? new Date(data.metadata.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  return (
    <article key={data.slug} className="pt-28 mb-20 -mt-28" id={data.slug}>
      <div className="flex gap-12 ">
        <div className="text-muted-foreground">{formattedDate}</div>
        <div className="max-w-[750px]">
          <Link
            className="mb-6 block hover:underline"
            href={`/changelog/${data.slug}`}
          >
            <h2 className="font-medium text-3xl mb-6">{data.metadata.title}</h2>
          </Link>
          <div className="prose dark:prose-invert">
            <MDXRemote source={data.content} />
          </div>
        </div>
      </div>
    </article>
  );
}
