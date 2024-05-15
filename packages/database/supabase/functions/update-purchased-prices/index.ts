import { serve } from "https://deno.land/std@0.175.0/http/server.ts";

import { format } from "https://deno.land/std@0.160.0/datetime/mod.ts";
import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";
import { corsHeaders } from "../lib/headers.ts";
import { getSupabaseServiceRole } from "../lib/supabase.ts";
import { Database } from "../lib/types.ts";

const pool = getConnectionPool(1);
const db = getDatabaseClient<DB>(pool);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { invoiceId } = await req.json();

  try {
    if (!invoiceId) throw new Error("Payload is missing invoiceId");

    const client = getSupabaseServiceRole(req.headers.get("Authorization"));

    const [purchaseInvoice, purchaseInvoiceLines] = await Promise.all([
      client.from("purchaseInvoice").select("*").eq("id", invoiceId).single(),
      client.from("purchaseInvoiceLine").select("*").eq("invoiceId", invoiceId),
    ]);

    if (purchaseInvoice.error)
      throw new Error("Failed to fetch purchaseInvoice");
    if (purchaseInvoiceLines.error)
      throw new Error("Failed to fetch receipt lines");

    const partIds = purchaseInvoiceLines.data
      .filter((line) => Boolean(line.partId))
      .map((line) => line.partId);

    const dateOneYearAgo = format(
      new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      "yyyy-MM-dd"
    );

    const companyId = purchaseInvoice.data.companyId;

    const [costLedgers, partSuppliers] = await Promise.all([
      client
        .from("costLedger")
        .select("*")
        .in("partId", partIds)
        .eq("companyId", companyId)
        .gte("postingDate", dateOneYearAgo),
      client
        .from("partSupplier")
        .select("*")
        .eq("supplierId", purchaseInvoice.data?.supplierId ?? "")
        .in("partId", partIds)
        .eq("companyId", companyId),
    ]);

    const partCostUpdates: Database["public"]["Tables"]["partCost"]["Update"][] =
      [];
    const partSupplierInserts: Database["public"]["Tables"]["partSupplier"]["Insert"][] =
      [];
    const partSupplierUpdates: Database["public"]["Tables"]["partSupplier"]["Update"][] =
      [];

    const historicalPartCosts: Record<
      string,
      { quantity: number; cost: number }
    > = {};

    costLedgers.data?.forEach((ledger) => {
      if (ledger.partId) {
        if (!historicalPartCosts[ledger.partId]) {
          historicalPartCosts[ledger.partId] = {
            quantity: 0,
            cost: 0,
          };
        }

        historicalPartCosts[ledger.partId].quantity += ledger.quantity;
        historicalPartCosts[ledger.partId].cost += ledger.cost;
      }
    });

    purchaseInvoiceLines.data.forEach((line) => {
      if (line.partId && historicalPartCosts[line.partId]) {
        partCostUpdates.push({
          partId: line.partId,
          unitCost:
            historicalPartCosts[line.partId].cost /
            historicalPartCosts[line.partId].quantity,
          updatedBy: "system",
        });

        const partSupplier = partSuppliers.data?.find(
          (partSupplier) =>
            partSupplier.partId === line.partId &&
            partSupplier.supplierId === purchaseInvoice.data?.supplierId
        );

        if (partSupplier && partSupplier.id) {
          partSupplierUpdates.push({
            id: partSupplier.id,
            unitPrice: line.unitPrice,
            conversionFactor: line.conversionFactor ?? 1,
            supplierUnitOfMeasureCode: line.purchaseUnitOfMeasureCode,
            updatedBy: "system",
          });
        } else {
          partSupplierInserts.push({
            partId: line.partId,
            supplierId: purchaseInvoice.data?.supplierId!,
            unitPrice: line.unitPrice,
            conversionFactor: line.conversionFactor ?? 1,
            supplierUnitOfMeasureCode: line.purchaseUnitOfMeasureCode,
            createdBy: "system",
            companyId,
          });
        }
      }
    });

    await db.transaction().execute(async (trx) => {
      if (partCostUpdates.length > 0) {
        for await (const partCostUpdate of partCostUpdates) {
          await trx
            .updateTable("partCost")
            .set(partCostUpdate)
            .where("partId", "=", partCostUpdate.partId!)
            .where("companyId", "=", companyId)
            .execute();
        }
      }

      if (partSupplierInserts.length > 0) {
        await trx
          .insertInto("partSupplier")
          .values(partSupplierInserts)
          .execute();
      }

      if (partSupplierUpdates.length > 0) {
        for await (const partSupplierUpdate of partSupplierUpdates) {
          await trx
            .updateTable("partSupplier")
            .set(partSupplierUpdate)
            .where("id", "=", partSupplierUpdate.id!)
            .execute();
        }
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
