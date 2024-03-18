import type { Json } from "@carbon/database";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { DataType } from "~/modules/shared";
import { path } from "~/utils/path";
import { useRouteData } from "./useRouteData";
//import UserSelect from "~/components/Selectors/UserSelect";

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
      accessorKey: `customFields.${field.id}`,
      header: field.name,
      cell: (item) => {
        switch (field.dataTypeId) {
          case DataType.Boolean:
            return item.row.original.customFields[field.id] === "on" ? "Yes" : "No";
          case DataType.Date:
            return item.row.original.customFields[field.id];
          case DataType.List:
            return item.row.original.customFields[field.id];
          case DataType.Numeric:
            return item.row.original.customFields[field.id];
          case DataType.Text:
            return item.row.original.customFields[field.id];
          case DataType.User:
            return null /*<UserSelect
                    type="employee"
                    usersOnly
                    isMulti={false}
                    readOnly={true}
                    value={item.row.original.customFields[field.id]}
                  />*/
          default:
            return null;
        }
      }});
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
