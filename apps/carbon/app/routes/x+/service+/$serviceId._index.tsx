import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { serviceId } = params;
  if (!serviceId) throw new Error("Could not find serviceId");
  throw redirect(path.to.serviceDetails(serviceId));
}
