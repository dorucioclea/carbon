import { Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import {
  CustomerAvatar,
  EmployeeAvatar,
  Hyperlink,
  New,
  Table,
} from "~/components";
import { usePermissions } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { Customer, CustomerStatus, CustomerType } from "~/modules/sales";
import { usePeople } from "~/stores";
import { path } from "~/utils/path";

type CustomersTableProps = {
  data: Customer[];
  count: number;
  customerTypes: Partial<CustomerType>[];
  customerStatuses: CustomerStatus[];
};

const CustomersTable = memo(
  ({ data, count, customerStatuses, customerTypes }: CustomersTableProps) => {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const [people] = usePeople();

    const customColumns = useCustomColumns<Customer>("customer");
    const columns = useMemo<ColumnDef<Customer>[]>(() => {
      const defaultColumns: ColumnDef<Customer>[] = [
        {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
            <Hyperlink to={path.to.customerDetails(row.original.id!)}>
              <CustomerAvatar customerId={row.original.id} />
            </Hyperlink>
          ),
        },

        {
          accessorKey: "type",
          header: "Customer Type",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: customerTypes?.map((type) => ({
                value: type.name ?? "",
                label: <Enumerable value={type.name ?? ""} />,
              })),
            },
          },
        },
        {
          accessorKey: "status",
          header: "Customer Status",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: customerStatuses?.map((status) => ({
                value: status.name,
                label: <Enumerable value={status.name ?? ""} />,
              })),
            },
          },
        },
        {
          id: "accountManagerId",
          header: "Account Manager",
          cell: ({ row }) => (
            <EmployeeAvatar employeeId={row.original.accountManagerId} />
          ),
          meta: {
            filter: {
              type: "static",
              options: people.map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
            },
          },
        },
        {
          id: "assignee",
          header: "Assignee",
          cell: ({ row }) => (
            <EmployeeAvatar employeeId={row.original.assignee} />
          ),
          meta: {
            filter: {
              type: "static",
              options: people.map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
            },
          },
        },
        {
          id: "createdBy",
          header: "Created By",
          cell: ({ row }) => (
            <EmployeeAvatar employeeId={row.original.createdBy} />
          ),
          meta: {
            filter: {
              type: "static",
              options: people.map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
            },
          },
        },
        {
          accessorKey: "createdAt",
          header: "Created At",
          cell: (item) => formatDate(item.getValue<string>()),
        },
        {
          id: "updatedBy",
          header: "Updated By",
          cell: ({ row }) => (
            <EmployeeAvatar employeeId={row.original.updatedBy} />
          ),
          meta: {
            filter: {
              type: "static",
              options: people.map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
            },
          },
        },
        {
          accessorKey: "updatedAt",
          header: "Created At",
          cell: (item) => formatDate(item.getValue<string>()),
        },
      ];

      return [...defaultColumns, ...customColumns];
    }, [customerTypes, customerStatuses, people, customColumns]);

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
          defaultColumnPinning={{
            left: ["name"],
          }}
          defaultColumnVisibility={{
            createdBy: false,
            createdAt: false,
            updatedBy: false,
            updatedAt: false,
          }}
          primaryAction={
            permissions.can("create", "sales") && (
              <New label="Customer" to={path.to.newCustomer} />
            )
          }
          renderContextMenu={renderContextMenu}
          withColumnOrdering
        />
      </>
    );
  }
);

CustomersTable.displayName = "CustomerTable";

export default CustomersTable;
