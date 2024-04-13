import type { Metadata } from "next";
import Link from "next/link";
import EmailForm from "~/components/EmailForm";
import { getBlogPosts } from "~/lib/blog";

export const metadata: Metadata = {
  title: "Carbon ERP | Story",
};

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
    <div className="container max-w-[750px] my-24 text-xl space-y-8">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="mx-auto text-3xl font-semibold tracking-tight leading-tighter sm:text-2xl lg:text-4xl xl:text-5xl ">
          Changelog
        </h1>
        <p>New updates and improvemets to Carbon</p>
        <EmailForm />
      </div>
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
    };
    content: string;
  };
};

export function Article({ data }: ArticleProps) {
  return (
    <article key={data.slug} className="pt-28 mb-20 -mt-28" id={data.slug}>
      <Link className="mb-6 block" href={`/changelog/${data.slug}`}>
        <h2 className="font-medium text-2xl mb-6">{data.metadata.title}</h2>
      </Link>

      <div className="updates">
        {/* {data.metadata.image && (
          <Image
            src={data.metadata.image}
            alt={data.metadata.title}
            width={680}
            height={442}
            className="mb-12"
          />
        )} */}

        {data.content}
      </div>
    </article>
  );
}
