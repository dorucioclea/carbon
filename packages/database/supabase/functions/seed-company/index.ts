import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";

import { corsHeaders } from "../lib/headers.ts";
import {
  accountCategories,
  accountDefaults,
  accounts,
  currencies,
  customerStatuses,
  fiscalYearSettings,
  integrations,
  paymentTerms,
  postingGroupInventory,
  postingGroupPurchasing,
  postingGroupSales,
  sequences,
  supplierStauses,
  unitOfMeasures,
} from "../lib/seed.ts";
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
      // supplier status
      await trx
        .insertInto("supplierStatus")
        .values(
          supplierStauses.map((name) => ({
            name,
            companyId,
            createdBy: "system",
          }))
        )
        .execute();

      // customer status
      await trx
        .insertInto("customerStatus")
        .values(
          customerStatuses.map((name) => ({
            name,
            companyId,
            createdBy: "system",
          }))
        )
        .execute();

      // payment terms
      await trx
        .insertInto("paymentTerm")
        .values(paymentTerms.map((pt) => ({ ...pt, companyId })))
        .execute();

      await trx
        .insertInto("unitOfMeasure")
        .values(unitOfMeasures.map((uom) => ({ ...uom, companyId })))
        .execute();

      await trx
        .insertInto("sequence")
        .values(sequences.map((s) => ({ ...s, companyId })))
        .execute();

      await trx
        .insertInto("currency")
        .values(currencies.map((c) => ({ ...c, companyId })))
        .execute();

      const accountCategoriesWithIds = await trx
        .insertInto("accountCategory")
        .values(accountCategories.map((ac) => ({ ...ac, companyId })))
        .returning(["id", "category"])
        .execute();

      const accountCategoriesByName = accountCategoriesWithIds.reduce<
        Record<string, string>
      >((acc, { id, category }) => {
        acc[category] = id;
        return acc;
      }, {});

      const getCategoryId = (category: string) =>
        accountCategoriesByName[category];

      await trx
        .insertInto("account")
        .values(
          accounts.map(({ accountCategory, ...a }) => ({
            ...a,
            companyId,
            accountCategoryId: getCategoryId(a.category),
          }))
        )
        .execute();

      await trx
        .insertInto("accountDefault")
        .values([
          {
            ...accountDefaults,
            companyId,
          },
        ])
        .execute();

      await trx
        .insertInto("postingGroupInventory")
        .values([{ ...postingGroupInventory, companyId }])
        .execute();

      await trx
        .insertInto("postingGroupPurchasing")
        .values([{ ...postingGroupPurchasing, companyId }])
        .execute();

      await trx
        .insertInto("postingGroupSales")
        .values([{ ...postingGroupSales, companyId }])
        .execute();

      await trx
        .insertInto("fiscalYearSettings")
        .values([{ ...fiscalYearSettings, companyId }])
        .execute();

      await trx
        .insertInto("integration")
        .values(integrations.map((i) => ({ ...i, companyId })))
        .execute();
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
