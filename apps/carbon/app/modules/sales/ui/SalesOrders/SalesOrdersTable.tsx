import {
  Checkbox,
  Enumerable,
  HStack,
  MenuIcon,
  MenuItem,
  useDisclosure,
} from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { useFetcher, useFetchers } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";
import { BsFillPenFill, BsPin, BsPinFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
//import { MdCallReceived } from "react-icons/md";
import {
  EmployeeAvatar,
  Hyperlink,
  New,
  CustomerAvatar,
  Table,
} from "~/components";
import { ConfirmDelete } from "~/components/Modals";
import { usePermissions } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { SalesOrder } from "~/modules/sales";
import { SalesStatus, salesOrderStatusType } from "~/modules/sales";
import { usePeople, useCustomers } from "~/stores";
import { favoriteSchema } from "~/types/validators";
import { path } from "~/utils/path";
import { useSalesOrder } from "./useSalesOrder";

type SalesOrdersTableProps = {
  data: SalesOrder[];
  count: number;
};

const SalesOrdersTable = memo(({ data, count }: SalesOrdersTableProps) => {
  const permissions = usePermissions();

  const [selectedSalesOrder, setSelectedSalesOrder] =
    useState<SalesOrder | null>(null);

  const deleteSalesOrderModal = useDisclosure();

  const [people] = usePeople();
  const [customers] = useCustomers();

  const fetcher = useFetcher();
  const optimisticFavorite = useOptimisticFavorite();

  const rows = useMemo<SalesOrder[]>(
    () =>
      data.map((d) =>
        d.id === optimisticFavorite?.id
          ? {
              ...d,
              favorite: optimisticFavorite?.favorite
                ? optimisticFavorite.favorite === "favorite"
                : d.favorite,
            }
          : d
      ),
    [data, optimisticFavorite]
  );

  const { edit } = useSalesOrder();

  const customColumns = useCustomColumns<SalesOrder>("salesOrder");

  const columns = useMemo<ColumnDef<SalesOrder>[]>(() => {
    const defaultColumns: ColumnDef<SalesOrder>[] = [
      {
        accessorKey: "salesOrderId",
        header: "Sales Order Number",
        cell: ({ row }) => (
          <HStack>
            {row.original.favorite ? (
              <fetcher.Form
                method="post"
                action={path.to.salesOrderFavorite}
                className="flex items-center"
              >
                <input type="hidden" name="id" value={row.original.id!} />
                <input type="hidden" name="favorite" value="unfavorite" />
                <button type="submit">
                  <BsPinFill
                    className="text-yellow-400 cursor-pointer h-4 w-4"
                    type="submit"
                  />
                </button>
              </fetcher.Form>
            ) : (
              <fetcher.Form
                method="post"
                action={path.to.salesOrderFavorite}
                className="flex items-center"
              >
                <input type="hidden" name="id" value={row.original.id!} />
                <input type="hidden" name="favorite" value="favorite" />
                <button type="submit">
                  <BsPin
                    className="text-yellow-400 cursor-pointer h-4 w-4"
                    type="submit"
                  />
                </button>
              </fetcher.Form>
            )}

            <Hyperlink to={path.to.salesOrderDetails(row.original.id!)}>
              {row.original.salesOrderId}
            </Hyperlink>
          </HStack>
        ),
      },
      {
        id: "customerId",
        header: "Customer",
        cell: ({ row }) => {
          return <CustomerAvatar customerId={row.original.customerId} />;
        },
        meta: {
          filter: {
            type: "static",
            options: customers?.map((customer) => ({
              value: customer.id,
              label: customer.name,
            })),
          },
        },
      },
      {
        accessorKey: "customerReference",
        header: "Customer Ref.",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "orderDate",
        header: "Order Date",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (item) => {
          const status = item.getValue<(typeof salesOrderStatusType)[number]>();
          return <SalesStatus status={status} />;
        },
        meta: {
          filter: {
            type: "static",
            options: salesOrderStatusType.map((status) => ({
              value: status,
              label: <SalesStatus status={status} />,
            })),
          },
          pluralHeader: "Statuses",
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
        accessorKey: "receiptPromisedDate",
        header: "Promised Date",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "shippingMethodName",
        header: "Shipping Method",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "shippingTermName",
        header: "Shipping Term",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
      },
      {
        accessorKey: "paymentTermName",
        header: "Payment Method",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
      },
      {
        accessorKey: "dropShipment",
        header: "Drop Shipment",
        cell: (item) => <Checkbox isChecked={item.getValue<boolean>()} />,
        meta: {
          filter: {
            type: "static",
            options: [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ],
          },
          pluralHeader: "Drop Shipment Statuses",
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
  }, [customers, people, customColumns, fetcher]);

  const renderContextMenu = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return (row: SalesOrder) => (
      <>
        <MenuItem
          disabled={!permissions.can("view", "sales")}
          onClick={() => edit(row)}
        >
          <MenuIcon icon={<BsFillPenFill />} />
          Edit
        </MenuItem>

        {/*<MenuItem
            disabled={
              !["To Recieve", "To Receive and Invoice"].includes(
                row.status ?? ""
              ) || !permissions.can("update", "inventory")
            }
            onClick={() => {
              receive(row);
            }}
          >
            <MenuIcon icon={<MdCallReceived />} />
            Receive
          </MenuItem>*/}
        <MenuItem
          disabled={!permissions.can("delete", "sales")}
          onClick={() => {
            setSelectedSalesOrder(row);
            deleteSalesOrderModal.onOpen();
          }}
        >
          <MenuIcon icon={<IoMdTrash />} />
          Delete
        </MenuItem>
      </>
    );
  }, [deleteSalesOrderModal, edit, permissions /*receive*/]);

  return (
    <>
      <Table<SalesOrder>
        count={count}
        columns={columns}
        data={rows}
        defaultColumnPinning={{
          left: ["salesOrderId"],
        }}
        defaultColumnVisibility={{
          receiptPromisedDate: false,
          shippingMethodName: false,
          shippingTermName: false,
          paymentTermName: false,
          dropShipment: false,
          createdBy: false,
          createdAt: false,
          updatedBy: false,
          updatedAt: false,
        }}
        primaryAction={
          permissions.can("create", "sales") && (
            <New label="Sales Order" to={path.to.newSalesOrder} />
          )
        }
        withColumnOrdering
        renderContextMenu={renderContextMenu}
      />

      {selectedSalesOrder && selectedSalesOrder.id && (
        <ConfirmDelete
          action={path.to.deleteSalesOrder(selectedSalesOrder.id)}
          isOpen={deleteSalesOrderModal.isOpen}
          name={selectedSalesOrder.salesOrderId!}
          text={`Are you sure you want to delete ${selectedSalesOrder.salesOrderId!}? This cannot be undone.`}
          onCancel={() => {
            deleteSalesOrderModal.onClose();
            setSelectedSalesOrder(null);
          }}
          onSubmit={() => {
            deleteSalesOrderModal.onClose();
            setSelectedSalesOrder(null);
          }}
        />
      )}
    </>
  );
});
SalesOrdersTable.displayName = "SalesOrdersTable";

export default SalesOrdersTable;

function useOptimisticFavorite() {
  const fetchers = useFetchers();
  const favoriteFetcher = fetchers.find(
    (f) => f.formAction === path.to.salesOrderFavorite
  );

  if (favoriteFetcher && favoriteFetcher.formData) {
    const id = favoriteFetcher.formData.get("id");
    const favorite = favoriteFetcher.formData.get("favorite") ?? "off";
    const submission = favoriteSchema.safeParse({ id, favorite });
    if (submission.success) {
      return submission.data;
    }
  }
}
