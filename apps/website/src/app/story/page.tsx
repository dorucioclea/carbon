/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { BsHexagonFill } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Carbon ERP | Story",
};

export default function Page() {
  return (
    <div className="prose dark:prose-invert container max-w-xl my-24 text-xl space-y-8">
      <h1 className="text-3xl font-semibold sm:text-2xl lg:text-4xl xl:text-5xl text-center">
        Building Carbon
      </h1>
      <p>
        In the year 2004, a state of the art manufacturing ERP tried to be a
        one-stop-shop for manufacturers&apos; software needs: estimating,
        scheduling, inventory, accounting, and more, all in a single package. It
        is now 2024, and manufacturing ERPs look remarkably similar to how they
        did 20 years ago. There are a handful of companies dedicated to
        continuous improvement and innovation, but the majority are resting on
        their laurels.
      </p>

      <p>
        The truth of the matter is this: the world has changed a lot in the last
        20 years, and the cutting-edge software of today would be nearly
        unrecognizable to our past selves. Pioneers in the software industry
        have shown us what is possible, and we as software users have come to
        expect more from our tools.
      </p>
      <p>
        We now live in a connected world. A single software tool can no longer
        be everything to everyone. In our daily lives we interact with an
        ecosystem of connected software - why should it be any different for a
        manufacturing business? The mission of Carbon ERP is to become the
        platform upon which connected manufacturing software ecosystems are
        built. The goal is not to do everything; the goal is to be the glue that
        connects the most innovative tools that the leading minds in
        manufacturing technology can dream up.
      </p>
      <BsHexagonFill />
    </div>
  );
}
