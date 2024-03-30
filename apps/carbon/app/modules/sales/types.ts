import type { Database } from "@carbon/database";
import type {
  getCustomer,
  getCustomerContacts,
  getCustomerLocations,
  getCustomers,
  getCustomerStatuses,
  getCustomerTypes,
  getQuoteAssembly,
  getQuoteExternalDocuments,
  getQuoteLines,
  getQuoteMaterials,
  getQuoteOperation,
  getQuotes,
} from "./sales.service";

export type Customer = NonNullable<
  Awaited<ReturnType<typeof getCustomers>>["data"]
>[number];

export type CustomerContact = NonNullable<
  Awaited<ReturnType<typeof getCustomerContacts>>["data"]
>[number];

export type CustomerDetail = NonNullable<
  Awaited<ReturnType<typeof getCustomer>>["data"]
>;

export type CustomerLocation = NonNullable<
  Awaited<ReturnType<typeof getCustomerLocations>>["data"]
>[number];

export type CustomerStatus = NonNullable<
  Awaited<ReturnType<typeof getCustomerStatuses>>["data"]
>[number];

export type CustomerType = NonNullable<
  Awaited<ReturnType<typeof getCustomerTypes>>["data"]
>[number];

export type QuotationAssembly = NonNullable<
  Awaited<ReturnType<typeof getQuoteAssembly>>["data"]
>;

export type QuotationAttachment = NonNullable<
  Awaited<ReturnType<typeof getQuoteExternalDocuments>>["data"]
>[number];

export type Quotation = NonNullable<
  Awaited<ReturnType<typeof getQuotes>>["data"]
>[number];

export type QuotationLine = NonNullable<
  Awaited<ReturnType<typeof getQuoteLines>>["data"]
>[number];

export type QuotationMaterial = NonNullable<
  Awaited<ReturnType<typeof getQuoteMaterials>>["data"]
>[number];

export type QuotationOperation = NonNullable<
  Awaited<ReturnType<typeof getQuoteOperation>>["data"]
>;

export type QuotationStatusType = Database["public"]["Enums"]["quoteStatus"];
