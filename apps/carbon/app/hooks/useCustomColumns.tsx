import type { Json } from "@carbon/database";
import type { ColumnDef } from "@tanstack/react-table";
import { DataType } from "~/modules/shared";
import { useCustomFieldsSchema } from "./useCustomFieldsSchema";
import { Checkbox, Enumerable } from "@carbon/react";

export function useCustomColumns<T extends { customFields: Json }>(
  table: string
) {
  const customFieldsSchemas = useCustomFieldsSchema();
  const schema = customFieldsSchemas?.[table];

  const customColumns: ColumnDef<T>[] = [];

  schema?.forEach((field) => {
    customColumns.push({
      accessorKey: `customFields.${field.id}`,
      header: field.name,
      cell: (item) => {
        switch (field.dataTypeId) {
          case DataType.Boolean:
            return isObject(item.row.original.customFields) &&
              field.id in item.row.original.customFields ? (
              <Checkbox
                isChecked={item.row.original?.customFields[field.id] === "on"}
              />
            ) : (
              <Checkbox isChecked={false} />
            );
          case DataType.Date:
            return isObject(item.row.original.customFields) &&
              field.id in item.row.original.customFields
              ? item.row.original?.customFields[field.id]
              : null;
          case DataType.List:
            return isObject(item.row.original.customFields) &&
              field.id in item.row.original.customFields ? (
              <Enumerable value={item.getValue<string>()} />
            ) : null;
          case DataType.Numeric:
            return isObject(item.row.original.customFields) &&
              field.id in item.row.original.customFields
              ? item.row.original?.customFields[field.id]
              : null;
          case DataType.Text:
            return isObject(item.row.original.customFields) &&
              field.id in item.row.original.customFields
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

  return customColumns as ColumnDef<T>[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}
