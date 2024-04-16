import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";

import { corsHeaders } from "../lib/headers.ts";
import { getSupabaseServiceRole } from "../lib/supabase.ts";

const pool = getConnectionPool(1);
const db = getDatabaseClient<DB>(pool);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { id: companyId } = await req.json();

  try {
    if (!companyId) throw new Error("Payload is missing id");

    const client = getSupabaseServiceRole(req.headers.get("Authorization"));
    await db.transaction().execute(async (trx) => {
      const supplierStauses = ["Active", "Inactive", "Pending", "Rejected"].map(
        (name) => ({ name, companyId, createdBy: "system" })
      );
      await trx.insertInto("supplierStatus").values(supplierStauses).execute();

      const customerStauses = [
        "Active",
        "Inactive",
        "Lead",
        "On Hold",
        "Cancelled",
      ].map((name) => ({ name, companyId, createdBy: "system" }));
      await trx.insertInto("customerStatus").values(customerStauses).execute();

      const paymentTerms = [
        {
          name: "Net 15",
          daysDue: 15,
          calculationMethod: "Net",
          daysDiscount: 0,
          discountPercentage: 0,
          companyId,
          createdBy: "system",
        },
        {
          name: "Net 30",
          daysDue: 30,
          calculationMethod: "Net",
          daysDiscount: 0,
          discountPercentage: 0,
          companyId,
          createdBy: "system",
        },
        {
          name: "Net 60",
          daysDue: 60,
          calculationMethod: "Net",
          daysDiscount: 0,
          discountPercentage: 0,
          companyId,
          createdBy: "system",
        },
        {
          name: "1% 10 Net 30",
          daysDue: 30,
          calculationMethod: "Net",
          daysDiscount: 10,
          discountPercentage: 1,
          companyId,
          createdBy: "system",
        },
        {
          name: "2% 10 Net 30",
          daysDue: 30,
          calculationMethod: "Net",
          daysDiscount: 10,
          discountPercentage: 2,
          companyId,
          createdBy: "system",
        },
        {
          name: "COD",
          daysDue: 0,
          calculationMethod: "Net",
          daysDiscount: 0,
          discountPercentage: 0,
          companyId,
          createdBy: "system",
        },
        {
          name: "Net EOM 10th",
          daysDue: 10,
          calculationMethod: "End of Month",
          daysDiscount: 0,
          discountPercentage: 0,
          companyId,
          createdBy: "system",
        },
      ];
      await trx.insertInto("paymentTerm").values(paymentTerms).execute();

      const unitOfMeasures = [
        {
          name: "Each",
          code: "EA",
          companyId,
          createdBy: "system",
        },
        {
          name: "Case",
          code: "CS",
          companyId,
          createdBy: "system",
        },
        {
          name: "Pack",
          code: "PK",
          companyId,
          createdBy: "system",
        },
        {
          name: "Pallet",
          code: "PL",
          companyId,
          createdBy: "system",
        },
        {
          name: "Roll",
          code: "RL",
          companyId,
          createdBy: "system",
        },
        {
          name: "Box",
          code: "BX",
          companyId,
          createdBy: "system",
        },
        {
          name: "Bag",
          code: "BG",
          companyId,
          createdBy: "system",
        },
        {
          name: "Drum",
          code: "DR",
          companyId,
          createdBy: "system",
        },
        {
          name: "Gallon",
          code: "GL",
          companyId,
          createdBy: "system",
        },
        {
          name: "Liter",
          code: "LT",
          companyId,
          createdBy: "system",
        },
        {
          name: "Ounce",
          code: "OZ",
          companyId,
          createdBy: "system",
        },
        {
          name: "Pound",
          code: "LB",
          companyId,
          createdBy: "system",
        },
        {
          name: "Ton",
          code: "TN",
          companyId,
          createdBy: "system",
        },
        {
          name: "Yard",
          code: "YD",
          companyId,
          createdBy: "system",
        },
        {
          name: "Meter",
          code: "MT",
          companyId,
          createdBy: "system",
        },
      ];
      await trx.insertInto("unitOfMeasure").values(unitOfMeasures).execute();

      const sequences = [
        {
          table: "purchaseOrder",
          name: "Purchase Order",
          prefix: "PO",
          suffix: null,
          next: 0,
          size: 6,
          step: 1,
          companyId,
        },
        {
          table: "purchaseInvoice",
          name: "Purchase Invoice",
          prefix: "AP",
          suffix: null,
          next: 0,
          size: 6,
          step: 1,
          companyId,
        },
        {
          table: "receipt",
          name: "Receipt",
          prefix: "RE",
          suffix: null,
          next: 0,
          size: 6,
          step: 1,
          companyId,
        },
        {
          table: "salesOrder",
          name: "Sales Order",
          prefix: "SO",
          suffix: null,
          next: 0,
          size: 6,
          step: 1,
          companyId,
        },
        {
          table: "salesInvoice",
          name: "Sales Invoice",
          prefix: "AR",
          suffix: null,
          next: 0,
          size: 6,
          step: 1,
          companyId,
        },
        {
          table: "requestForQuote",
          name: "Request For Quote",
          prefix: "RFQ",
          suffix: null,
          next: 0,
          size: 6,
          step: 1,
          companyId,
        },
      ];
      await trx.insertInto("sequence").values(sequences).execute();
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
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
