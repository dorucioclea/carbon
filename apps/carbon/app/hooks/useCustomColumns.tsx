import type { ColumnDef } from "@tanstack/react-table";
import { DataType } from "~/modules/shared";
import { useCustomFieldsSchema } from "./useCustomFieldsSchema";

export function useCustomColumns(table: string) {
  const customFieldsSchemas = useCustomFieldsSchema();
  const schema = customFieldsSchemas?.[table];

  const customColumns: ColumnDef<any>[] = [];

  schema?.forEach((field) => {
    customColumns.push({
      accessorKey: `customFields.${field.id}`,
      header: field.name,
      cell: (item) => {
        switch (field.dataTypeId) {
          case DataType.Boolean:
            return item.row.original?.customFields
              ? item.row.original?.customFields[field.id] === "on"
                ? "Yes"
                : "No"
              : null;
          case DataType.Date:
            return item.row.original?.customFields
              ? item.row.original?.customFields[field.id]
              : null;
          case DataType.List:
            return item.row.original?.customFields
              ? item.row.original?.customFields[field.id]
              : null;
          case DataType.Numeric:
            return item.row.original?.customFields
              ? item.row.original?.customFields[field.id]
              : null;
          case DataType.Text:
            return item.row.original?.customFields
              ? item.row.original?.customFields[field.id]
              : null;
          case DataType.User:
            return null; /*<UserSelect
                    type="employee"
                    usersOnly
                    isMulti={false}
                    readOnly={true}
                    value={item.row.original.customFields[field.id]}
                  />*/
          default:
            return null;
        }
      },
    });
  });

  return customColumns;
}
