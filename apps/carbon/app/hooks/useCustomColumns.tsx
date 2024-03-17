import type { Json } from "@carbon/database";
import { Enumerable } from "@carbon/react";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { path } from "~/utils/path";
import { useRouteData } from "./useRouteData";

export function useCustomColumns(table: string) {
  const data = useRouteData<{
    customFields: { table: string; name: string; fields: Json[] }[];
  }>(path.to.authenticatedRoot);

  const schema = useMemo<Fields>(() => {
    let schemaResult: Fields = [];
    data?.customFields.forEach((field) => {
      if (field.table === table) {
        const fields = fieldValidator.safeParse(field.fields);
        if (fields.success && "table" in field) {
          schemaResult = fields.data;
        }
      }
    });
    return schemaResult;
  }, [data?.customFields, table]);

  if (!schema) {
    return [];
  }

  const customColumns: ColumnDef<any>[] = [];

  schema.forEach((field) => {
    customColumns.push({
      accessorKey: field.name,
      header: field.name,
      cell: (item) => <Enumerable value={item.getValue<string>()} />,
    });
  });

  return customColumns;
}

const fieldValidator = z
  .array(
    z.object({
      dataTypeId: z.number(),
      id: z.string(),
      listOptions: z.array(z.string()).nullable(),
      name: z.string(),
      sortOrder: z.number(),
    })
  )
  .nullable();
type Fields = z.infer<typeof fieldValidator>;
