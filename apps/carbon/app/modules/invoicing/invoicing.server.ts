import { getSupabaseServiceRole } from "~/lib/supabase";

export async function createPurchaseInvoiceFromPurchaseOrder(
  purchaseOrderId: string,
  companyId: string,
  userId: string
) {
  const client = getSupabaseServiceRole();
  return client.functions.invoke<{ id: string }>(
    "create-purchase-invoice-from-purchase-order",
    {
      body: {
        id: purchaseOrderId,
        companyId,
        userId,
      },
    }
  );
}
