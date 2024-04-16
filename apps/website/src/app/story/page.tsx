/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { BsHexagonFill } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Carbon ERP | Story",
};

export default function Page() {
  return (
    <div className="prose dark:prose-invert container max-w-[750px] my-24 text-xl space-y-8">
      <h1 className="text-3xl font-semibold sm:text-2xl lg:text-4xl xl:text-5xl text-center">
        Building Carbon
      </h1>
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </p>
      <p>
        It has survived not only five centuries, but also the leap into
        electronic typesetting, remaining essentially unchanged. It was
        popularized in the 1960s with the release of Letraset sheets containing
        Lorem Ipsum passages, and more recently with desktop publishing software
        like Aldus PageMaker including versions of Lorem Ipsum.
      </p>
      <BsHexagonFill />
    </div>
  );
}
