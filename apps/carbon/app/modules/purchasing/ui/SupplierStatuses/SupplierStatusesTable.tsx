import { Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill, BsPeopleFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { SupplierStatus } from "~/modules/purchasing";
import { path } from "~/utils/path";

type SupplierStatusesTableProps = {
  data: SupplierStatus[];
  count: number;
};

const SupplierStatusesTable = memo(
  ({ data, count }: SupplierStatusesTableProps) => {
    const [params] = useUrlParams();
    const navigate = useNavigate();
    const permissions = usePermissions();

    const customColumns = useCustomColumns("supplierStatus");
    const columns = useMemo<ColumnDef<SupplierStatus>[]>(() => {
      const defaultColumns = [
        {
          accessorKey: "name",
          header: "Supplier Status",
          cell: ({ row }) => (
            <Enumerable
              value={row.original.name}
              onClick={() => navigate(row.original.id as string)}
              className="cursor-pointer"
            />
          ),
        },
      ];
      return [...defaultColumns, ...customColumns];
    }, [navigate, customColumns]);

    const renderContextMenu = useCallback(
      (row: SupplierStatus) => {
        return (
          <>
            <MenuItem
              onClick={() => {
                navigate(`${path.to.suppliers}?status=${row.id}`);
              }}
            >
              <MenuIcon icon={<BsPeopleFill />} />
              View Suppliers
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(
                  `${path.to.supplierStatus(row.id)}?${params.toString()}`
                );
              }}
            >
              <MenuIcon icon={<BsFillPenFill />} />
              Edit Supplier Status
            </MenuItem>
            <MenuItem
              disabled={!permissions.can("delete", "purchasing")}
              onClick={() => {
                navigate(
                  `${path.to.deleteSupplierStatus(row.id)}?${params.toString()}`
                );
              }}
            >
              <MenuIcon icon={<IoMdTrash />} />
              Delete Supplier Status
            </MenuItem>
          </>
        );
      },
      [navigate, params, permissions]
    );

    return (
      <Table<SupplierStatus>
        data={data}
        columns={columns}
        count={count}
        renderContextMenu={renderContextMenu}
      />
    );
  }
);

SupplierStatusesTable.displayName = "SupplierStatusesTable";
export default SupplierStatusesTable;
