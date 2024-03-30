import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { partId } = params;
  if (!partId) throw new Error("Could not find partId");
  throw redirect(path.to.partDetails(partId));
}
