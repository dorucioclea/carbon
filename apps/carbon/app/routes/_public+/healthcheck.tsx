import { getSupabaseServiceRole } from "~/lib/supabase";

export async function loader() {
  try {
    const client = getSupabaseServiceRole();
    const test = await client.from("attributeDataType").select("*");
    if (test.error !== null) throw test.error;
    return new Response("OK");
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
