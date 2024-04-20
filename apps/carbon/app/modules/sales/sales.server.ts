import { getSupabaseServiceRole } from "~/lib/supabase";

export async function createSalesOrderFromQuote(
  quoteId: string,
  userId: string
) {
  const client = getSupabaseServiceRole();
  return client.functions.invoke<{ id: string }>(
    "create-sales-order-from-quote",
    {
      body: {
        id: quoteId,
        userId: userId,
      },
    }
  );
}