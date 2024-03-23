import { Button, Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { Hyperlink, New, Table } from "~/components";
import { usePermissions } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type {
  Supplier,
  SupplierStatus,
  SupplierType,
} from "~/modules/purchasing";
import { path } from "~/utils/path";

type SuppliersTableProps = {
  data: Supplier[];
  count: number;
  supplierTypes: Partial<SupplierType>[];
  supplierStatuses: SupplierStatus[];
};

const SuppliersTable = memo(
  ({ data, count, supplierStatuses, supplierTypes }: SuppliersTableProps) => {
    const navigate = useNavigate();
    const permissions = usePermissions();

    const customColumns = useCustomColumns<Supplier>("supplier");
    const columns = useMemo<ColumnDef<Supplier>[]>(() => {
      const defaultColumns: ColumnDef<Supplier>[] = [
        {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
            <Hyperlink to={path.to.supplierDetails(row.original.id!)}>
              {row.original.name}
            </Hyperlink>
          ),
        },
        {
          accessorKey: "type",
          header: "Supplier Type",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: supplierTypes?.map((type) => ({
                value: type.name ?? "",
                label: <Enumerable value={type.name ?? ""} />,
              })),
            },
          },
        },
        {
          accessorKey: "status",
          header: "Supplier Status",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: supplierStatuses?.map((status) => ({
                value: status.name,
                label: <Enumerable value={status.name ?? ""} />,
              })),
            },
          },
        },
        {
          id: "orders",
          header: "Orders",
          cell: ({ row }) => (
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  `${path.to.purchaseOrders}?filter=supplierName:eq:${row.original.name}`
                )
              }
            >
              {row.original.orderCount ?? 0} Orders
            </Button>
          ),
        },
        {
          id: "parts",
          header: "Parts",
          cell: ({ row }) => (
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`${path.to.partsSearch}?supplierId=${row.original.id}`)
              }
            >
              {row.original.partCount ?? 0} Parts
            </Button>
          ),
        },
      ];
      return [...defaultColumns, ...customColumns];
    }, [navigate, supplierStatuses, supplierTypes, customColumns]);

    const renderContextMenu = useMemo(
      // eslint-disable-next-line react/display-name
      () => (row: Supplier) =>
        (
          <MenuItem onClick={() => navigate(path.to.supplier(row.id!))}>
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Supplier
          </MenuItem>
        ),
      [navigate]
    );

    return (
      <>
        <Table<Supplier>
          count={count}
          columns={columns}
          data={data}
          primaryAction={
            permissions.can("create", "purchasing") && (
              <New label="Supplier" to={path.to.newSupplier} />
            )
          }
          renderContextMenu={renderContextMenu}
        />
      </>
    );
  }
);

SuppliersTable.displayName = "SupplierTable";

export default SuppliersTable;
