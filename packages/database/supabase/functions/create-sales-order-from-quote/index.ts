import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";

import { corsHeaders } from "../lib/headers.ts";
import { getSupabaseServiceRole } from "../lib/supabase.ts";
import { Database } from "../lib/types.ts";
import { getNextSequence } from "../shared/get-next-sequence.ts";

const pool = getConnectionPool(1);
const db = getDatabaseClient<DB>(pool);

export type SalesOrderLineItem = Omit<
  Database["public"]["Tables"]["salesOrderLine"]["Insert"],
  "id" | "salesOrderId" | "updatedBy" | "createdAt" | "updatedAt"
>;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { id: quoteId, userId } = await req.json();

  try {
    if (!quoteId) throw new Error("Payload is missing id");
    if (!userId) throw new Error("Payload is missing userId");

    const client = getSupabaseServiceRole(req.headers.get("Authorization"));

    const [quote, quoteLines] =
      await Promise.all([
        client
          .from("quote")
          .select("*")
          .eq("id", quoteId)
          .single(),
        client
          .from("quoteLine")
          .select("*")
          .eq("quoteId", quoteId),
      ]);

    if (!quote.data) throw new Error("Quote not found");
    if (quoteLines.error) throw new Error(quoteLines.error.message);

    const salesOrderLines = quoteLines.data.reduce<SalesOrderLineItem[]>(
      (acc, d) => {  
        acc.push({
          salesOrderLineType: "Part",
          partId: d.partId,
          description: d.description,
          createdBy: userId,
        });

        return acc;
      },
      []
    );

    let salesOrderId = "";

    await db.transaction().execute(async (trx) => {
      const currentDate = new Date();
      
      const quoteUpdate = await trx
      .updateTable("quote")
      .set({
        status: "Ordered",
        quoteDate: currentDate,
        updatedAt: currentDate,
        updatedBy: userId,
      })
      .where("id", "=", quoteId)
      .execute();
  
      if (quoteUpdate.error) throw new Error("Sales order not created");

      const quoteLinesUpdate = await trx
      .updateTable("quoteLine")
      .set({
        status: "Complete",
        updatedAt: currentDate,
        updatedBy: userId,
      })
      .where("quoteId", "=", quoteId)
      .execute();

      if (quoteLinesUpdate.error) throw new Error("Sales order not created");

      salesOrderId = await getNextSequence(trx, "salesOrder");

      const salesOrder = await trx
        .insertInto("salesOrder")
        .values({
          salesOrderId: salesOrderId,
          createdBy: userId,
          quoteId: quote.data.id,
          customerId: quote.data.customerId,
          orderDate: new Date().toISOString(),
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      if (!salesOrder.id) throw new Error("Sales order not created");
      salesOrderId = salesOrder.id;


      await trx
        .insertInto("salesOrderLine")
        .values(
          salesOrderLines.map((line) => ({
            ...line,
            salesOrderId: salesOrderId
          }))
        )
        .execute();
      
    });

    return new Response(
      JSON.stringify({
        id: salesOrderId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify(err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-sales-order-from-quote' \
    --header 'Authorization: Bearer ey.....' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
