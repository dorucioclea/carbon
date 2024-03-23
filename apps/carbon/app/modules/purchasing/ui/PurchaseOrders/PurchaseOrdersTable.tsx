import {
  Checkbox,
  Enumerable,
  HStack,
  MenuIcon,
  MenuItem,
  useDisclosure,
} from "@carbon/react";
import { useFetcher, useFetchers } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";
import { BsFillPenFill, BsPin, BsPinFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { MdCallReceived } from "react-icons/md";
import { Avatar, Hyperlink, New, Table } from "~/components";
import { ConfirmDelete } from "~/components/Modals";
import { usePermissions } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { PurchaseOrder } from "~/modules/purchasing";
import {
  PurchasingStatus,
  purchaseOrderStatusType,
} from "~/modules/purchasing";
import { useSuppliers } from "~/stores";
import { favoriteSchema } from "~/types/validators";
import { path } from "~/utils/path";
import { usePurchaseOrder } from "./usePurchaseOrder";

type PurchaseOrdersTableProps = {
  data: PurchaseOrder[];
  count: number;
};

const PurchaseOrdersTable = memo(
  ({ data, count }: PurchaseOrdersTableProps) => {
    const permissions = usePermissions();

    const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
      useState<PurchaseOrder | null>(null);

    const deletePurchaseOrderModal = useDisclosure();
    const [suppliers] = useSuppliers();

    const fetcher = useFetcher();
    const optimisticFavorite = useOptimisticFavorite();

    const rows = useMemo<PurchaseOrder[]>(
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

    const { edit, receive } = usePurchaseOrder();

    const customColumns = useCustomColumns<PurchaseOrder>("purchaseOrder");

    const columns = useMemo<ColumnDef<PurchaseOrder>[]>(() => {
      const defaultColumns: ColumnDef<PurchaseOrder>[] = [
        {
          accessorKey: "purchaseOrderId",
          header: "PO Number",
          cell: ({ row }) => (
            <HStack>
              {row.original.favorite ? (
                <fetcher.Form
                  method="post"
                  action={path.to.purchaseOrderFavorite}
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
                  action={path.to.purchaseOrderFavorite}
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

              <Hyperlink to={path.to.purchaseOrderDetails(row.original.id!)}>
                {row.original.purchaseOrderId}
              </Hyperlink>
            </HStack>
          ),
        },
        {
          accessorKey: "supplierName",
          header: "Supplier",
          cell: (item) => item.getValue(),
          meta: {
            filter: {
              type: "static",
              options: suppliers?.map((supplier) => ({
                value: supplier.name,
                label: supplier.name,
              })),
            },
          },
        },
        {
          accessorKey: "supplierReference",
          header: "Supplier Ref.",
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
            const status =
              item.getValue<(typeof purchaseOrderStatusType)[number]>();
            return <PurchasingStatus status={status} />;
          },
          meta: {
            filter: {
              type: "static",
              options: purchaseOrderStatusType.map((status) => ({
                value: status,
                label: <PurchasingStatus status={status} />,
              })),
            },
            pluralHeader: "Statuses",
          },
        },
        {
          accessorKey: "receiptPromisedDate",
          header: "Promised Date",
          cell: (item) => item.getValue(),
        },
        {
          acessorKey: "shippingMethodName",
          header: "Shipping Method",
          cell: (item) => item.getValue(),
        },
        {
          acessorKey: "shippingTermName",
          header: "Shipping Term",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
        },
        {
          acessorKey: "paymentTermName",
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
          accessorKey: "createdByFullName",
          header: "Created By",
          cell: ({ row }) => {
            return (
              <HStack>
                <Avatar size="sm" path={row.original.createdByAvatar} />
                <p>{row.original.createdByFullName}</p>
              </HStack>
            );
          },
        },
        {
          accessorKey: "createdAt",
          header: "Created At",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "updatedByFullName",
          header: "Updated By",
          cell: ({ row }) => {
            return row.original.updatedByFullName ? (
              <HStack>
                <Avatar size="sm" path={row.original.updatedByAvatar ?? null} />
                <p>{row.original.updatedByFullName}</p>
              </HStack>
            ) : null;
          },
        },
        {
          accessorKey: "updatedAt",
          header: "Updated At",
          cell: (item) => item.getValue(),
        },
      ];

      return [...defaultColumns, ...customColumns];
    }, [fetcher, suppliers, customColumns]);

    const renderContextMenu = useMemo(() => {
      // eslint-disable-next-line react/display-name
      return (row: PurchaseOrder) => (
        <>
          <MenuItem
            disabled={!permissions.can("view", "purchasing")}
            onClick={() => edit(row)}
          >
            <MenuIcon icon={<BsFillPenFill />} />
            Edit
          </MenuItem>

          <MenuItem
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
          </MenuItem>
          <MenuItem
            disabled={!permissions.can("delete", "purchasing")}
            onClick={() => {
              setSelectedPurchaseOrder(row);
              deletePurchaseOrderModal.onOpen();
            }}
          >
            <MenuIcon icon={<IoMdTrash />} />
            Delete
          </MenuItem>
        </>
      );
    }, [deletePurchaseOrderModal, edit, permissions, receive]);

    return (
      <>
        <Table<PurchaseOrder>
          count={count}
          columns={columns}
          data={rows}
          defaultColumnPinning={{
            left: ["purchaseOrderId"],
          }}
          primaryAction={
            permissions.can("create", "purchasing") && (
              <New label="Purchase Order" to={path.to.newPurchaseOrder} />
            )
          }
          withColumnOrdering
          renderContextMenu={renderContextMenu}
        />

        {selectedPurchaseOrder && selectedPurchaseOrder.id && (
          <ConfirmDelete
            action={path.to.deletePurchaseOrder(selectedPurchaseOrder.id)}
            isOpen={deletePurchaseOrderModal.isOpen}
            name={selectedPurchaseOrder.purchaseOrderId!}
            text={`Are you sure you want to delete ${selectedPurchaseOrder.purchaseOrderId!}? This cannot be undone.`}
            onCancel={() => {
              deletePurchaseOrderModal.onClose();
              setSelectedPurchaseOrder(null);
            }}
            onSubmit={() => {
              deletePurchaseOrderModal.onClose();
              setSelectedPurchaseOrder(null);
            }}
          />
        )}
      </>
    );
  }
);
PurchaseOrdersTable.displayName = "PurchaseOrdersTable";

export default PurchaseOrdersTable;

function useOptimisticFavorite() {
  const fetchers = useFetchers();
  const favoriteFetcher = fetchers.find(
    (f) => f.formAction === path.to.purchaseOrderFavorite
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
