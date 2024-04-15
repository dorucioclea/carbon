/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { BsHexagonFill } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Carbon ERP | Story",
};

export default function Page() {
  return (
    <div className="prose dark:prose-invert container max-w-[750px] my-24 text-xl space-y-8">
      <h1 className="text-3xl font-semibold sm:text-2xl lg:text-4xl xl:text-5xl">
        Building Carbon
      </h1>
      <p>
        Two problems with manufacturing ERPs.
        <br />
        1. They don&apos;t provide answers to hard questions like:
      </p>
      <ul>
        <li>Where is my bottleneck?</li>
        <li>Where do I need to add resources?</li>
        <li>How long is it going to take to make this thing?</li>
      </ul>
      <p>
        2. After you get outside of the standard "box" model, it's difficult to
        do things that are specific to your business, because existing ERPs are
        effectively a giant black box of REST APIs.
      </p>
      <p>
        In order to solve the first problem, you need to have a
        manufacturing-specific system that knows about all the variables. A
        point solution (or an combination of point solutions) won't work.
      </p>
      <p>
        In order to solve the second problem, it's got to be open-source. And it
        can't be a GPL license because businesses don't want to open-source
        their proprietary solutions.
      </p>
      <BsHexagonFill />
    </div>
  );
}
