import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { personId } = params;
  if (!personId) throw new Error("Could not find personId");
  throw redirect(path.to.personDetails(personId));
}
