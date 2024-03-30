import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { customerId } = params;
  if (!customerId) throw new Error("Could not find customerId");
  throw redirect(path.to.customerDetails(customerId));
}
