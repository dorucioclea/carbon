import type { Database, Json } from "@carbon/database";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { GenericQueryFilters } from "~/utils/query";
import { setGenericQueryFilters } from "~/utils/query";
import { sanitize } from "~/utils/supabase";
import type {
  customerContactValidator,
  customerPaymentValidator,
  customerShippingValidator,
  customerStatusValidator,
  customerTypeValidator,
  customerValidator,
  quotationAssemblyValidator,
  quotationLineValidator,
  quotationMaterialValidator,
  quotationOperationValidator,
  quotationPricingValidator,
  quotationValidator,
} from "./sales.models";

export async function deleteCustomerContact(
  client: SupabaseClient<Database>,
  customerId: string,
  customerContactId: string
) {
  return client
    .from("customerContact")
    .delete()
    .eq("customerId", customerId)
    .eq("id", customerContactId);
}

export async function deleteCustomerLocation(
  client: SupabaseClient<Database>,
  customerId: string,
  customerLocationId: string
) {
  return client
    .from("customerLocation")
    .delete()
    .eq("customerId", customerId)
    .eq("id", customerLocationId);
}

export async function deleteCustomerStatus(
  client: SupabaseClient<Database>,
  customerStatusId: string
) {
  return client.from("customerStatus").delete().eq("id", customerStatusId);
}

export async function deleteCustomerType(
  client: SupabaseClient<Database>,
  customerTypeId: string
) {
  return client.from("customerType").delete().eq("id", customerTypeId);
}

export async function deleteQuote(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.from("quote").delete().eq("id", quoteId);
}

export async function deleteQuoteAssembly(
  client: SupabaseClient<Database>,
  quoteAssemblyId: string
) {
  return client.from("quoteAssembly").delete().eq("id", quoteAssemblyId);
}

export async function deleteQuoteLine(
  client: SupabaseClient<Database>,
  quoteLineId: string
) {
  return client.from("quoteLine").delete().eq("id", quoteLineId);
}

export async function deleteQuoteMaterial(
  client: SupabaseClient<Database>,
  quoteMaterialId: string
) {
  return client.from("quoteMaterial").delete().eq("id", quoteMaterialId);
}

export async function deleteQuoteOperation(
  client: SupabaseClient<Database>,
  quoteOperationId: string
) {
  return client.from("quoteOperation").delete().eq("id", quoteOperationId);
}

export async function getCustomer(
  client: SupabaseClient<Database>,
  customerId: string
) {
  return client.from("customer").select("*").eq("id", customerId).single();
}

export async function getCustomerContact(
  client: SupabaseClient<Database>,
  customerContactId: string
) {
  return client
    .from("customerContact")
    .select(
      "*, contact(id, firstName, lastName, email, mobilePhone, homePhone, workPhone, fax, title, addressLine1, addressLine2, city, state, postalCode, country(id, name), birthday, notes)"
    )
    .eq("id", customerContactId)
    .single();
}

export async function getCustomerContacts(
  client: SupabaseClient<Database>,
  customerId: string
) {
  return client
    .from("customerContact")
    .select(
      "*, contact(id, firstName, lastName, email, mobilePhone, homePhone, workPhone, fax, title, addressLine1, addressLine2, city, state, postalCode, country(id, name), birthday, notes), user(id, active)"
    )
    .eq("customerId", customerId);
}

export async function getCustomerLocation(
  client: SupabaseClient<Database>,
  customerContactId: string
) {
  return client
    .from("customerLocation")
    .select(
      "*, address(id, addressLine1, addressLine2, city, state, country(id, name), postalCode)"
    )
    .eq("id", customerContactId)
    .single();
}

export async function getCustomerLocations(
  client: SupabaseClient<Database>,
  customerId: string
) {
  return client
    .from("customerLocation")
    .select(
      "*, address(id, addressLine1, addressLine2, city, state, country(id, name), postalCode)"
    )
    .eq("customerId", customerId);
}

export async function getCustomerPayment(
  client: SupabaseClient<Database>,
  customerId: string
) {
  return client
    .from("customerPayment")
    .select("*")
    .eq("customerId", customerId)
    .single();
}

export async function getCustomerShipping(
  client: SupabaseClient<Database>,
  customerId: string
) {
  return client
    .from("customerShipping")
    .select("*")
    .eq("customerId", customerId)
    .single();
}

export async function getCustomers(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    search: string | null;
  }
) {
  let query = client.from("customers").select("*", {
    count: "exact",
  });

  if (args.search) {
    query = query.ilike("name", `%${args.search}%`);
  }

  query = setGenericQueryFilters(query, args, [
    { column: "name", ascending: true },
  ]);
  return query;
}

export async function getCustomersList(client: SupabaseClient<Database>) {
  return client.from("customer").select("id, name").order("name");
}

export async function getCustomerStatus(
  client: SupabaseClient<Database>,
  customerStatusId: string
) {
  return client
    .from("customerStatus")
    .select("*")
    .eq("id", customerStatusId)
    .single();
}

export async function getCustomerStatuses(
  client: SupabaseClient<Database>,
  args?: GenericQueryFilters & { search: string | null }
) {
  let query = client
    .from("customerStatus")
    .select("id, name, customFields", { count: "exact" });

  if (args?.search) {
    query = query.ilike("name", `%${args.search}%`);
  }

  if (args) {
    query = setGenericQueryFilters(query, args, [
      { column: "name", ascending: true },
    ]);
  }

  return query;
}

export async function getCustomerStatusesList(
  client: SupabaseClient<Database>
) {
  return client.from("customerStatus").select("id, name").order("name");
}

export async function getCustomerType(
  client: SupabaseClient<Database>,
  customerTypeId: string
) {
  return client
    .from("customerType")
    .select("*")
    .eq("id", customerTypeId)
    .single();
}

export async function getCustomerTypes(
  client: SupabaseClient<Database>,
  args?: GenericQueryFilters & { search: string | null }
) {
  let query = client.from("customerType").select("*", { count: "exact" });

  if (args?.search) {
    query = query.ilike("name", `%${args.search}%`);
  }

  if (args) {
    query = setGenericQueryFilters(query, args, [
      { column: "name", ascending: true },
    ]);
  }

  return query;
}

export async function getCustomerTypesList(client: SupabaseClient<Database>) {
  return client.from("customerType").select("id, name").order("name");
}

export async function getQuote(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.from("quotes").select("*").eq("id", quoteId).single();
}

export async function getQuotes(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    search: string | null;
  }
) {
  let query = client.from("quotes").select("*", { count: "exact" });

  if (args.search) {
    query = query.or(
      `quoteId.ilike.%${args.search}%,name.ilike.%${args.search}%,customerReference.ilike%${args.search}%`
    );
  }

  query = setGenericQueryFilters(query, args, [
    { column: "favorite", ascending: false },
    { column: "id", ascending: false },
  ]);
  return query;
}

export async function getQuoteAssembly(
  client: SupabaseClient<Database>,
  quoteAssemblyId: string
) {
  return client
    .from("quoteAssembly")
    .select("*")
    .eq("id", quoteAssemblyId)
    .single();
}

export async function getQuoteAssembliesByLine(
  client: SupabaseClient<Database>,
  quoteLineId: string
) {
  return client
    .from("quoteAssembly")
    .select("*")
    .eq("quoteLineId", quoteLineId);
}

export async function getQuoteAssemblies(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.from("quoteAssembly").select("*").eq("quoteId", quoteId);
}

export async function getQuoteExternalDocuments(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.storage.from("quote-external").list(quoteId);
}

export async function getQuoteInternalDocuments(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.storage.from("quote-internal").list(quoteId);
}

export async function getQuoteLine(
  client: SupabaseClient<Database>,
  quoteLineId: string
) {
  return client.from("quoteLine").select("*").eq("id", quoteLineId).single();
}

export async function getQuoteLines(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.from("quoteLines").select("*").eq("quoteId", quoteId);
}

export async function getQuoteCustomerDetails(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client
    .from("quoteCustomerDetails")
    .select("*")
    .eq("quoteId", quoteId)
    .single();
}

export async function getQuoteLinePrice(
  client: SupabaseClient<Database>,
  quoteLineId: string
) {
  return client
    .from("quoteLinePrice")
    .select("*")
    .eq("quoteLineId", quoteLineId)
    .single();
}

export async function getQuoteLinePricesByQuoteId(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client
    .from("quoteLinePrice")
    .select("*")
    .eq("quoteId", quoteId)
    .order("createdAt");
}

export async function getQuoteMaterials(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.from("quoteMaterial").select("*").eq("quoteId", quoteId);
}

export async function getQuoteMaterialsByLine(
  client: SupabaseClient<Database>,
  quoteLineId: string
) {
  return client
    .from("quoteMaterial")
    .select("*")
    .eq("quoteLineId", quoteLineId);
}

export async function getQuoteMaterialsByOperation(
  client: SupabaseClient<Database>,
  quoteOperationId: string
) {
  return client
    .from("quoteMaterial")
    .select("*")
    .eq("quoteOperationId", quoteOperationId);
}

export async function getQuoteOperation(
  client: SupabaseClient<Database>,
  quoteOperationId: string
) {
  return client
    .from("quoteOperation")
    .select("*")
    .eq("id", quoteOperationId)
    .single();
}

export async function getQuoteOperationsByLine(
  client: SupabaseClient<Database>,
  quoteLineId: string
) {
  return client
    .from("quoteOperation")
    .select("*")
    .eq("quoteLineId", quoteLineId);
}

export async function getQuoteOperations(
  client: SupabaseClient<Database>,
  quoteId: string
) {
  return client.from("quoteOperation").select("*").eq("quoteId", quoteId);
}

export async function insertCustomerContact(
  client: SupabaseClient<Database>,
  customerContact: {
    customerId: string;
    contact: z.infer<typeof customerContactValidator>;
    customFields?: Json;
  }
) {
  const insertContact = await client
    .from("contact")
    .insert([customerContact.contact])
    .select("id")
    .single();
  if (insertContact.error) {
    return insertContact;
  }

  const contactId = insertContact.data?.id;
  if (!contactId) {
    return { data: null, error: new Error("Contact ID not found") };
  }

  return client
    .from("customerContact")
    .insert([
      {
        customerId: customerContact.customerId,
        contactId,
        customFields: customerContact.customFields,
      },
    ])
    .select("id")
    .single();
}

export async function insertCustomerLocation(
  client: SupabaseClient<Database>,
  customerLocation: {
    customerId: string;
    address: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      // countryId: string;
      postalCode?: string;
    };
    customFields?: Json;
  }
) {
  const insertAddress = await client
    .from("address")
    .insert([customerLocation.address])
    .select("id")
    .single();
  if (insertAddress.error) {
    return insertAddress;
  }

  const addressId = insertAddress.data?.id;
  if (!addressId) {
    return { data: null, error: new Error("Address ID not found") };
  }

  return client
    .from("customerLocation")
    .insert([
      {
        customerId: customerLocation.customerId,
        addressId,
        customFields: customerLocation.customFields,
      },
    ])
    .select("id")
    .single();
}

export async function insertQuoteLinePrice(
  client: SupabaseClient<Database>,
  quoteLinePrice: {
    quoteId: string;
    quoteLineId: string;
    quantity?: number;
    markupPercent?: number;
    unitCost?: number;
    createdBy: string;
  }
) {
  const quoteLine = await getQuoteLine(client, quoteLinePrice.quoteLineId);
  if (quoteLine.error) {
    return quoteLine;
  }

  let unitCost = 0;

  if (quoteLine.data?.replenishmentSystem === "Buy") {
    const partId = quoteLine.data?.partId;
    const [partCost] = await Promise.all([
      client.from("partCost").select("unitCost").eq("partId", partId).single(),
    ]);

    if (partCost.error) {
      return partCost;
    }

    unitCost = partCost.data?.unitCost;
  }

  const totalCost = unitCost * (quoteLinePrice.quantity ?? 0);

  return client.from("quoteLinePrice").insert([
    {
      ...quoteLinePrice,
      unitCost,
      extendedPrice:
        totalCost + totalCost * ((quoteLinePrice?.markupPercent ?? 0) / 100),
    },
  ]);
}

export async function releaseQuote(
  client: SupabaseClient<Database>,
  quoteId: string,
  usedId: string
) {
  const quoteUpdate = await client
    .from("quote")
    .update({
      status: "Open",
      quoteDate: today(getLocalTimeZone()).toString(),
      updatedAt: today(getLocalTimeZone()).toString(),
      updatedBy: usedId,
    })
    .eq("id", quoteId);

  if (quoteUpdate.error) {
    return quoteUpdate;
  }

  return client
    .from("quoteLine")
    .update({
      status: "Complete",
      updatedAt: today(getLocalTimeZone()).toString(),
      updatedBy: usedId,
    })
    .eq("quoteId", quoteId);
}

export async function upsertCustomer(
  client: SupabaseClient<Database>,
  customer:
    | (Omit<z.infer<typeof customerValidator>, "id"> & {
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof customerValidator>, "id"> & {
        id: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("createdBy" in customer) {
    return client.from("customer").insert([customer]).select("*").single();
  }
  return client
    .from("customer")
    .update({
      ...sanitize(customer),
      updatedAt: today(getLocalTimeZone()).toString(),
    })
    .eq("id", customer.id)
    .select("id")
    .single();
}

export async function updateCustomerContact(
  client: SupabaseClient<Database>,
  customerContact: {
    contactId: string;
    contact: z.infer<typeof customerContactValidator>;
    customFields?: Json;
  }
) {
  if (customerContact.customFields) {
    const customFieldUpdate = await client
      .from("customerContact")
      .update({ customFields: customerContact.customFields })
      .eq("contactId", customerContact.contactId);

    if (customFieldUpdate.error) {
      return customFieldUpdate;
    }
  }
  return client
    .from("contact")
    .update(sanitize(customerContact.contact))
    .eq("id", customerContact.contactId)
    .select("id")
    .single();
}

export async function updateCustomerLocation(
  client: SupabaseClient<Database>,
  customerLocation: {
    addressId: string;
    address: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      // countryId: string;
      postalCode?: string;
    };
    customFields?: Json;
  }
) {
  if (customerLocation.customFields) {
    const customFieldUpdate = await client
      .from("customerLocation")
      .update({ customFields: customerLocation.customFields })
      .eq("addressId", customerLocation.addressId);

    if (customFieldUpdate.error) {
      return customFieldUpdate;
    }
  }
  return client
    .from("address")
    .update(sanitize(customerLocation.address))
    .eq("id", customerLocation.addressId)
    .select("id")
    .single();
}
export async function updateCustomerPayment(
  client: SupabaseClient<Database>,
  customerPayment: z.infer<typeof customerPaymentValidator> & {
    updatedBy: string;
  }
) {
  return client
    .from("customerPayment")
    .update(sanitize(customerPayment))
    .eq("customerId", customerPayment.customerId);
}

export async function updateCustomerShipping(
  client: SupabaseClient<Database>,
  customerShipping: z.infer<typeof customerShippingValidator> & {
    updatedBy: string;
  }
) {
  return client
    .from("customerShipping")
    .update(sanitize(customerShipping))
    .eq("customerId", customerShipping.customerId);
}

export async function upsertCustomerStatus(
  client: SupabaseClient<Database>,
  customerStatus:
    | (Omit<z.infer<typeof customerStatusValidator>, "id"> & {
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof customerStatusValidator>, "id"> & {
        id: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("createdBy" in customerStatus) {
    return client.from("customerStatus").insert([customerStatus]).select("id");
  } else {
    return client
      .from("customerStatus")
      .update(sanitize(customerStatus))
      .eq("id", customerStatus.id);
  }
}

export async function upsertCustomerType(
  client: SupabaseClient<Database>,
  customerType:
    | (Omit<z.infer<typeof customerTypeValidator>, "id"> & {
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof customerTypeValidator>, "id"> & {
        id: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("createdBy" in customerType) {
    return client.from("customerType").insert([customerType]).select("id");
  } else {
    return client
      .from("customerType")
      .update(sanitize(customerType))
      .eq("id", customerType.id);
  }
}

export async function updateQuoteFavorite(
  client: SupabaseClient<Database>,
  args: {
    id: string;
    favorite: boolean;
    userId: string;
  }
) {
  const { id, favorite, userId } = args;
  if (!favorite) {
    return client
      .from("quoteFavorite")
      .delete()
      .eq("quoteId", id)
      .eq("userId", userId);
  } else {
    return client.from("quoteFavorite").insert({ quoteId: id, userId: userId });
  }
}

export async function upsertQuote(
  client: SupabaseClient<Database>,
  quote:
    | (Omit<z.infer<typeof quotationValidator>, "id" | "quoteId"> & {
        quoteId: string;
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof quotationValidator>, "id" | "quoteId"> & {
        id: string;
        quoteId: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("createdBy" in quote) {
    return client.from("quote").insert([quote]).select("id, quoteId");
  } else {
    return client
      .from("quote")
      .update({
        ...sanitize(quote),
        updatedAt: today(getLocalTimeZone()).toString(),
      })
      .eq("id", quote.id);
  }
}

export async function upsertQuoteAssembly(
  client: SupabaseClient<Database>,
  quotationAssembly:
    | (Omit<z.infer<typeof quotationAssemblyValidator>, "id"> & {
        quoteId: string;
        quoteLineId: string;
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof quotationAssemblyValidator>, "id"> & {
        id: string;
        quoteId: string;
        quoteLineId: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("id" in quotationAssembly) {
    return client
      .from("quoteAssembly")
      .update(sanitize(quotationAssembly))
      .eq("id", quotationAssembly.id)
      .select("id")
      .single();
  }
  return client
    .from("quoteAssembly")
    .insert([quotationAssembly])
    .select("id")
    .single();
}

export async function upsertQuoteLine(
  client: SupabaseClient<Database>,
  quotationLine:
    | (Omit<z.infer<typeof quotationLineValidator>, "id"> & {
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof quotationLineValidator>, "id"> & {
        id: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("id" in quotationLine) {
    return client
      .from("quoteLine")
      .update(sanitize(quotationLine))
      .eq("id", quotationLine.id)
      .select("id")
      .single();
  }
  return client.from("quoteLine").insert([quotationLine]).select("*").single();
}

export async function updateQuoteLinePrice(
  client: SupabaseClient<Database>,
  quoteLinePrice: z.infer<typeof quotationPricingValidator> & {
    quoteId: string;
    quoteLineId: string;
    updatedBy: string;
  }
) {
  return client
    .from("quoteLinePrice")
    .update(sanitize(quoteLinePrice))
    .eq("quoteLineId", quoteLinePrice.quoteLineId);
}

export async function upsertQuoteMaterial(
  client: SupabaseClient<Database>,
  quotationMaterial:
    | (Omit<z.infer<typeof quotationMaterialValidator>, "id"> & {
        quoteId: string;
        quoteLineId: string;
        quoteOperationId: string;
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof quotationMaterialValidator>, "id"> & {
        id: string;
        quoteId: string;
        quoteLineId: string;
        quoteOperationId: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("id" in quotationMaterial) {
    return client
      .from("quoteMaterial")
      .update(sanitize(quotationMaterial))
      .eq("id", quotationMaterial.id)
      .select("id")
      .single();
  }
  return client
    .from("quoteMaterial")
    .insert([quotationMaterial])
    .select("id")
    .single();
}

export async function upsertQuoteOperation(
  client: SupabaseClient<Database>,
  quotationOperation:
    | (Omit<z.infer<typeof quotationOperationValidator>, "id"> & {
        quoteId: string;
        quoteLineId: string;
        createdBy: string;
        customFields?: Json;
      })
    | (Omit<z.infer<typeof quotationOperationValidator>, "id"> & {
        id: string;
        quoteId: string;
        quoteLineId: string;
        updatedBy: string;
        customFields?: Json;
      })
) {
  if ("id" in quotationOperation) {
    return client
      .from("quoteOperation")
      .update(sanitize(quotationOperation))
      .eq("id", quotationOperation.id)
      .select("id")
      .single();
  }
  return client
    .from("quoteOperation")
    .insert([quotationOperation])
    .select("id")
    .single();
}
