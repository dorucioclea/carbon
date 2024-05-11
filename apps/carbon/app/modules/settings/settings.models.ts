import { z } from "zod";
import { zfd } from "zod-form-data";
import { DataType } from "~/modules/shared";

export const modulesType = [
  "Accounting",
  // "Documents",
  "Invoicing",
  "Inventory",
  "Jobs",
  // "Messaging",
  "Parts",
  "Purchasing",
  "Resources",
  "Sales",
  // "Scheduling",
  // "Timecards",
  "Users",
] as const;

const company = {
  name: z.string().min(1, { message: "Name is required" }),
  taxId: zfd.text(z.string().optional()),
  addressLine1: z.string().min(1, { message: "Address is required" }),
  addressLine2: zfd.text(z.string().optional()),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  postalCode: z.string().min(1, { message: "Zip is required" }),
  countryCode: zfd.text(z.string().optional()),
  phone: zfd.text(z.string().optional()),
  fax: zfd.text(z.string().optional()),
  email: zfd.text(z.string().optional()),
  website: zfd.text(z.string().optional()),
};

export const companyValidator = z.object(company);
export const onboardingCompanyValidator = z.object({
  ...company,
  next: z.string().min(1, { message: "Next is required" }),
});

export const customFieldValidator = z
  .object({
    id: zfd.text(z.string().optional()),
    name: z.string().min(1, { message: "Name is required" }),
    table: z.string().min(1, { message: "Table is required" }),
    dataTypeId: zfd.numeric(
      z.number().min(1, { message: "Data type is required" })
    ),
    listOptions: z.string().min(1).array().optional(),
  })
  .refine((input) => {
    // allows bar to be optional only when foo is 'foo'
    if (
      input.dataTypeId === DataType.List &&
      (input.listOptions === undefined ||
        input.listOptions.length === 0 ||
        input.listOptions.some((option) => option.length === 0))
    )
      return false;

    return true;
  });

export const sequenceValidator = z.object({
  table: z.string().min(1, { message: "Table is required" }),
  prefix: zfd.text(z.string().optional()),
  suffix: zfd.text(z.string().optional()),
  next: zfd.numeric(z.number().min(0)),
  step: zfd.numeric(z.number().min(1)),
  size: zfd.numeric(z.number().min(1).max(20)),
});

export const themes = [
  "zinc",
  "neutral",
  "red",
  "rose",
  "orange",
  "green",
  "blue",
  "yellow",
  "violet",
] as const;
export type Theme = (typeof themes)[number];

export const themeValidator = z.object({
  next: zfd.text(z.string().optional()),
  theme: z.enum(themes, {
    errorMap: (issue, ctx) => ({ message: "Theme is required" }),
  }),
});
