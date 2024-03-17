import { Enumerable, Hyperlink, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { Table } from "~/components";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { Customer } from "~/modules/sales";
import { path } from "~/utils/path";

type CustomersTableProps = {
  data: Customer[];
  count: number;
};

const CustomersTable = memo(({ data, count }: CustomersTableProps) => {
  const navigate = useNavigate();
  const customColumns = useCustomColumns("customer");

  const columns = useMemo(() => {
    const defaultColumns = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Hyperlink
            onClick={() => navigate(path.to.customer(row.original.id!))}
          >
            {row.original.name}
          </Hyperlink>
        ),
      },
      {
        accessorKey: "type",
        header: "Customer Type",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
      },
      {
        accessorKey: "status",
        header: "Customer Status",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
      },
      // {
      //   id: "orders",
      //   header: "Orders",
      //   cell: ({ row }) => (
      //
      //       <Button
      //         variant="secondary"
      //         onClick={() =>
      //           navigate(`${path.to.salesOrders}?customerId=${row.original.id}`)
      //         }
      //       >
      //         {row.original.orderCount ?? 0} Orders
      //       </Button>
      //   ),
      // },
    ];

    return [...defaultColumns, ...customColumns];
  }, [navigate, customColumns]);

  const renderContextMenu = useMemo(
    // eslint-disable-next-line react/display-name
    () => (row: Customer) =>
      (
        <MenuItem onClick={() => navigate(path.to.customer(row.id!))}>
          <MenuIcon icon={<BsFillPenFill />} />
          Edit Customer
        </MenuItem>
      ),
    [navigate]
  );

  return (
    <>
      <Table<Customer>
        count={count}
        columns={columns}
        data={data}
        withPagination
        renderContextMenu={renderContextMenu}
      />
    </>
  );
});

CustomersTable.displayName = "CustomerTable";

export default CustomersTable;
