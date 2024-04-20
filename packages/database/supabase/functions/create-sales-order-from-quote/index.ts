import { getLocalTimeZone, today } from "@internationalized/date";
import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";

import { corsHeaders } from "../lib/headers.ts";
import { getSupabaseServiceRole } from "../lib/supabase.ts";
import { Database } from "../lib/types.ts";
import { getNextSequence } from "../shared/get-next-sequence.ts";

const pool = getConnectionPool(1);
const db = getDatabaseClient<DB>(pool);

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

    let salesOrderId = "";

    await db.transaction().execute(async (trx) => {

      const quoteUpdate = await trx
        .from("quote")
        .update({
          status: "Ordered",
          quoteDate: today(getLocalTimeZone()).toString(),
          updatedAt: today(getLocalTimeZone()).toString(),
          updatedBy: userId,
        })
        .eq("id", quoteId);
  
      if (quoteUpdate.error) throw new Error("Sales order not created");

      const quoteLinesUpdate = await trx
      .from("quoteLine")
      .update({
        status: "Complete",
        updatedAt: today(getLocalTimeZone()).toString(),
        updatedBy: userId,
      })
      .eq("quoteId", quoteId);

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

      const constructedSalesOrderLines = quoteLines?.data.map(
        (quoteLine) => {
          return {
            salesOrderId: salesOrderId,
            salesOrderLineType: "Part",
            partId: quoteLine.partId,
            description: quoteLine.description,
            createdBy: userId,
          };
        }
      );

      await trx
        .insertInto("salesOrderLine")
        .values(constructedSalesOrderLines)
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
