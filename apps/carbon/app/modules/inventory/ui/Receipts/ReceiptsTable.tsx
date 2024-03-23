import {
  Checkbox,
  Enumerable,
  HStack,
  MenuIcon,
  MenuItem,
} from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Avatar, Hyperlink, New, Table } from "~/components";
import { usePermissions, useRealtime, useUrlParams } from "~/hooks";
import type { Receipt } from "~/modules/inventory";
import {
  ReceiptStatus,
  receiptSourceDocumentType,
  receiptStatusType,
} from "~/modules/inventory";
import { useSuppliers } from "~/stores";
import type { ListItem } from "~/types";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import { path } from "~/utils/path";

type ReceiptsTableProps = {
  data: Receipt[];
  count: number;
  locations: ListItem[];
};

const ReceiptsTable = memo(({ data, count, locations }: ReceiptsTableProps) => {
  useRealtime("receipt", `id=in.(${data.map((d) => d.id).join(",")})`);

  const [params] = useUrlParams();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const rows = useMemo(() => data, [data]);
  const [suppliers] = useSuppliers();
  const customColumns = useCustomColumns<Receipt>("receipt");

  const columns = useMemo<ColumnDef<Receipt>[]>(() => {
    const result: ColumnDef<(typeof rows)[number]>[] = [
      {
        accessorKey: "receiptId",
        header: "Receipt ID",
        cell: ({ row }) => (
          <Hyperlink to={row.original.id!}>{row.original.receiptId}</Hyperlink>
        ),
      },
      {
        accessorKey: "sourceDocument",
        header: "Source Document",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
        meta: {
          filter: {
            type: "static",
            options: receiptSourceDocumentType.map((type) => ({
              value: type,
              label: <Enumerable value={type} />,
            })),
          },
        },
      },
      {
        accessorKey: "sourceDocumentReadableId",
        header: "Source Document ID",
        cell: ({ row }) => {
          if (!row.original.sourceDocumentId) return null;
          switch (row.original.sourceDocument) {
            case "Purchase Order":
              return (
                <Hyperlink
                  to={path.to.purchaseOrderDetails(
                    row.original.sourceDocumentId!
                  )}
                >
                  {row.original.sourceDocumentReadableId}
                </Hyperlink>
              );
            case "Purchase Invoice":
              return (
                <Hyperlink
                  to={path.to.purchaseInvoice(row.original.sourceDocumentId!)}
                >
                  {row.original.sourceDocumentReadableId}
                </Hyperlink>
              );
            default:
              return null;
          }
        },
      },
      {
        accessorKey: "locationName",
        header: "Location",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
        meta: {
          filter: {
            type: "static",
            options: locations.map(({ name }) => ({
              value: name,
              label: <Enumerable value={name} />,
            })),
          },
        },
      },
      {
        accessorKey: "supplierName",
        header: "Supplier",
        cell: (item) => item.getValue() ?? null,
        meta: {
          filter: {
            type: "static",
            options: suppliers.map(({ name }) => ({
              value: name,
              label: name,
            })),
          },
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (item) => {
          const status = item.getValue<(typeof receiptStatusType)[number]>();
          return <ReceiptStatus status={status} />;
        },
        meta: {
          filter: {
            type: "static",
            options: receiptStatusType.map((type) => ({
              value: type,
              label: <ReceiptStatus status={type} />,
            })),
          },
          pluralHeader: "Statuses",
        },
      },
      {
        accessorKey: "postingDate",
        header: "Posting Date",
        cell: (item) => formatDate(item.getValue<string>()),
      },
      {
        accessorKey: "invoiced",
        header: "Invoiced",
        cell: (item) => <Checkbox isChecked={item.getValue<boolean>()} />,
        meta: {
          filter: {
            type: "static",
            options: [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ],
          },
          pluralHeader: "Invoiced Statuses",
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
        cell: (item) => formatDate(item.getValue<string>()),
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
        cell: (item) => formatDate(item.getValue<string>()),
      },
    ];

    return [...result,...customColumns];
  }, [locations, suppliers, customColumns]);


  const renderContextMenu = useCallback(
    (row: Receipt) => {
      return (
        <>
          <MenuItem
            disabled={!permissions.can("update", "inventory")}
            onClick={() => {
              navigate(`${path.to.receipt(row.id!)}?${params.toString()}`);
            }}
          >
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Receipt
          </MenuItem>
          <MenuItem
            disabled={
              !permissions.can("delete", "inventory") ||
              !!row.postingDate ||
              row.status === "Pending"
            }
            onClick={() => {
              navigate(
                `${path.to.deleteReceipt(row.id!)}?${params.toString()}`
              );
            }}
          >
            <MenuIcon icon={<IoMdTrash />} />
            Delete Receipt
          </MenuItem>
        </>
      );
    },
    [navigate, params, permissions]
  );

  return (
    <Table<(typeof data)[number]>
      data={data}
      columns={columns}
      count={count}
      defaultColumnPinning={{
        left: ["receiptId"],
      }}
      primaryAction={
        permissions.can("create", "inventory") && (
          <New label="Receipt" to={path.to.newReceipt} />
        )
      }
      renderContextMenu={renderContextMenu}
      withColumnOrdering
    />
  );
});

ReceiptsTable.displayName = "ReceiptsTable";
export default ReceiptsTable;
