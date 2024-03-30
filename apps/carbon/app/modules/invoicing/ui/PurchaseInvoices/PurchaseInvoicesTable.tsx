import { Enumerable, MenuIcon, MenuItem, useDisclosure } from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import {
  EmployeeAvatar,
  Hyperlink,
  New,
  SupplierAvatar,
  Table,
} from "~/components";
import { ConfirmDelete } from "~/components/Modals";
import { usePermissions, useRealtime } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { PurchaseInvoice } from "~/modules/invoicing";
import {
  PurchaseInvoicingStatus,
  purchaseInvoiceStatusType,
} from "~/modules/invoicing";
import { usePeople, useSuppliers } from "~/stores";
import { path } from "~/utils/path";

type PurchaseInvoicesTableProps = {
  data: PurchaseInvoice[];
  count: number;
};

const PurchaseInvoicesTable = memo(
  ({ data, count }: PurchaseInvoicesTableProps) => {
    useRealtime(
      "purchaseInvoice",
      `id=in.(${data.map((d) => d.id).join(",")})`
    );

    const permissions = usePermissions();
    const navigate = useNavigate();

    const [selectedPurchaseInvoice, setSelectedPurchaseInvoice] =
      useState<PurchaseInvoice | null>(null);
    const closePurchaseInvoiceModal = useDisclosure();

    const [people] = usePeople();
    const [suppliers] = useSuppliers();
    const customColumns = useCustomColumns<PurchaseInvoice>("purchaseInvoice");

    const columns = useMemo<ColumnDef<PurchaseInvoice>[]>(() => {
      const defaultColumns: ColumnDef<PurchaseInvoice>[] = [
        {
          accessorKey: "invoiceId",
          header: "Invoice Number",
          cell: ({ row }) => (
            <Hyperlink to={path.to.purchaseInvoiceDetails(row.original.id!)}>
              {row.original?.invoiceId}
            </Hyperlink>
          ),
        },
        {
          id: "supplierId",
          header: "Supplier",
          cell: ({ row }) => (
            <SupplierAvatar supplierId={row.original.supplierId} />
          ),
          meta: {
            filter: {
              type: "static",
              options: suppliers?.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              })),
            },
          },
        },
        {
          id: "invoiceSupplierId",
          header: "Invoice Supplier",
          cell: ({ row }) => (
            <SupplierAvatar supplierId={row.original.invoiceSupplierId} />
          ),
          meta: {
            filter: {
              type: "static",
              options: suppliers?.map((supplier) => ({
                value: supplier.id,
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
          accessorKey: "status",
          header: "Status",
          cell: (item) => {
            const status =
              item.getValue<(typeof purchaseInvoiceStatusType)[number]>();
            return <PurchaseInvoicingStatus status={status} />;
          },
          meta: {
            filter: {
              type: "static",
              options: purchaseInvoiceStatusType.map((status) => ({
                value: status,
                label: <PurchaseInvoicingStatus status={status} />,
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
          accessorKey: "dateIssued",
          header: "Issued Date",
          cell: (item) => formatDate(item.getValue<string>()),
        },
        {
          accessorKey: "dateDue",
          header: "Due Date",
          cell: (item) => formatDate(item.getValue<string>()),
        },
        {
          accessorKey: "datePaid",
          header: "Paid Date",
          cell: (item) => formatDate(item.getValue<string>()),
        },
        {
          accessorKey: "paymentTermName",
          header: "Payment Method",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
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
    }, [customColumns, people, suppliers]);

    const renderContextMenu = useMemo(() => {
      // eslint-disable-next-line react/display-name
      return (row: PurchaseInvoice) => (
        <>
          <MenuItem
            disabled={!permissions.can("view", "invoicing")}
            onClick={() => navigate(path.to.purchaseInvoice(row.id!))}
          >
            <MenuIcon icon={<BsFillPenFill />} />
            Edit
          </MenuItem>
          <MenuItem
            disabled={
              row.status !== "Draft" || !permissions.can("delete", "invoicing")
            }
            onClick={() => {
              setSelectedPurchaseInvoice(row);
              closePurchaseInvoiceModal.onOpen();
            }}
          >
            <MenuIcon icon={<IoMdTrash />} />
            Delete
          </MenuItem>
        </>
      );
    }, [closePurchaseInvoiceModal, navigate, permissions]);

    return (
      <>
        <Table<PurchaseInvoice>
          count={count}
          columns={columns}
          data={data}
          defaultColumnPinning={{
            left: ["invoiceId"],
          }}
          defaultColumnVisibility={{
            invoiceSupplierId: false,
            paymentTermName: false,
            dateIssued: false,
            datePaid: false,
            createdAt: false,
            createdBy: false,
            updatedAt: false,
            updatedBy: false,
          }}
          primaryAction={
            permissions.can("create", "invoicing") && (
              <New label="Purchase Invoice" to={path.to.newPurchaseInvoice} />
            )
          }
          withColumnOrdering
          renderContextMenu={renderContextMenu}
        />

        {selectedPurchaseInvoice && selectedPurchaseInvoice.id && (
          <ConfirmDelete
            action={path.to.deletePurchaseInvoice(selectedPurchaseInvoice.id)}
            isOpen={closePurchaseInvoiceModal.isOpen}
            name={selectedPurchaseInvoice.invoiceId!}
            text={`Are you sure you want to permanently delete ${selectedPurchaseInvoice.invoiceId!}?`}
            onCancel={() => {
              closePurchaseInvoiceModal.onClose();
              setSelectedPurchaseInvoice(null);
            }}
            onSubmit={() => {
              closePurchaseInvoiceModal.onClose();
              setSelectedPurchaseInvoice(null);
            }}
          />
        )}
      </>
    );
  }
);

PurchaseInvoicesTable.displayName = "PurchaseInvoicesTable";

export default PurchaseInvoicesTable;
