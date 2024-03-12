import type {
  getCompany,
  getCustomField,
  getCustomFieldsTables,
  getIntegrations,
  getSequences,
} from "./settings.service";

export type Company = NonNullable<
  Awaited<ReturnType<typeof getCompany>>["data"]
>;

export type CustomField = NonNullable<
  Awaited<ReturnType<typeof getCustomField>>["data"]
>;

export type CustomFieldsTableType = NonNullable<
  Awaited<ReturnType<typeof getCustomFieldsTables>>["data"]
>[number];

export type Integration = NonNullable<
  Awaited<ReturnType<typeof getIntegrations>>["data"]
>[number];

export type Sequence = NonNullable<
  Awaited<ReturnType<typeof getSequences>>["data"]
>[number];
