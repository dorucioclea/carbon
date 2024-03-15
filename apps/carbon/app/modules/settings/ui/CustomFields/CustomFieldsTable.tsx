import {
  Button,
  Enumerable,
  Hyperlink,
  MenuIcon,
  MenuItem,
} from "@carbon/react";
import { Link, useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { BsListUl } from "react-icons/bs";
import { Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { CustomFieldsTableType } from "~/modules/settings";
import { path } from "~/utils/path";

type CustomFieldsTableProps = {
  data: CustomFieldsTableType[];
  count: number;
};

const CustomFieldsTable = memo(({ data, count }: CustomFieldsTableProps) => {
  const navigate = useNavigate();
  const [params] = useUrlParams();
  const permissions = usePermissions();

  const columns = useMemo<ColumnDef<CustomFieldsTableType>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Table",
        cell: ({ row }) => (
          <Hyperlink onClick={() => navigate(row.original.id!)}>
            {row.original.name}
          </Hyperlink>
        ),
      },
      {
        accessorKey: "module",
        header: "Module",
        cell: ({ row }) => <Enumerable value={row.original.module} />,
      },
      {
        header: "Fields",
        cell: ({ row }) => (
          <Button variant="secondary" asChild>
            <Link
              to={`${path.to.customFieldList(
                row.original.id!
              )}?${params?.toString()}`}
            >
              {Array.isArray(row.original.fields)
                ? row.original.fields?.length ?? 0
                : 0}{" "}
              Fields
            </Link>
          </Button>
        ),
      },
    ];
  }, [navigate, params]);

  const renderContextMenu = useCallback(
    (row: (typeof data)[number]) => {
      return (
        <>
          <MenuItem
            onClick={() => {
              navigate(
                `${path.to.newCustomField(row.id!)}?${params?.toString()}`
              );
            }}
          >
            <MenuIcon icon={<BiAddToQueue />} />
            New Field
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(
                `${path.to.customFieldList(row.id!)}?${params?.toString()}`
              );
            }}
          >
            <MenuIcon icon={<BsListUl />} />
            View Custom Fields
          </MenuItem>
        </>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, params, permissions]
  );

  return (
    <>
      <Table<CustomFieldsTableType>
        data={data}
        columns={columns}
        count={count ?? 0}
        renderContextMenu={renderContextMenu}
      />
    </>
  );
});

CustomFieldsTable.displayName = "CustomFieldsTable";
export default CustomFieldsTable;
