import { Hyperlink, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill, BsPeopleFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { CustomerStatus } from "~/modules/sales";
import { path } from "~/utils/path";

type CustomerStatusesTableProps = {
  data: CustomerStatus[];
  count: number;
};

const CustomerStatusesTable = memo(
  ({ data, count }: CustomerStatusesTableProps) => {
    const [params] = useUrlParams();
    const navigate = useNavigate();
    const permissions = usePermissions();

    const columns = useMemo<ColumnDef<CustomerStatus>[]>(() => {
      return [
        {
          accessorKey: "name",
          header: "Customer Status",
          cell: ({ row }) => (
            <Hyperlink onClick={() => navigate(row.original.id as string)}>
              {row.original.name}
            </Hyperlink>
          ),
        },
      ];
    }, [navigate]);

    const renderContextMenu = useCallback(
      (row: CustomerStatus) => {
        return (
          <>
            <MenuItem
              onClick={() => {
                navigate(`${path.to.customers}?status=${row.id}`);
              }}
            >
              <MenuIcon icon={<BsPeopleFill />} />
              View Customers
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(
                  `${path.to.customerStatus(row.id)}?${params.toString()}`
                );
              }}
            >
              <MenuIcon icon={<BsFillPenFill />} />
              Edit Customer Status
            </MenuItem>
            <MenuItem
              disabled={!permissions.can("delete", "sales")}
              onClick={() => {
                navigate(
                  `${path.to.deleteCustomerStatus(row.id)}?${params.toString()}`
                );
              }}
            >
              <MenuIcon icon={<IoMdTrash />} />
              Delete Customer Status
            </MenuItem>
          </>
        );
      },
      [navigate, params, permissions]
    );

    return (
      <Table<CustomerStatus>
        data={data}
        columns={columns}
        count={count}
        renderContextMenu={renderContextMenu}
      />
    );
  }
);

CustomerStatusesTable.displayName = "CustomerStatusesTable";
export default CustomerStatusesTable;
