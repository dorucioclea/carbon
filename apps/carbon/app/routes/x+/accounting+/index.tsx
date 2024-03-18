import { redirect } from "@vercel/remix";
import { path } from "~/utils/path";

export async function loader() {
  return redirect(path.to.chartOfAccounts);
}
