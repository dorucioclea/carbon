import { Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { LuPencil, LuTrash } from "react-icons/lu";
import { Hyperlink, New, Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import {
  paymentTermsCalculationMethod,
  type PaymentTerm,
} from "~/modules/accounting";
import { path } from "~/utils/path";

type PaymentTermsTableProps = {
  data: PaymentTerm[];
  count: number;
};

const PaymentTermsTable = memo(({ data, count }: PaymentTermsTableProps) => {
  const [params] = useUrlParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const customColumns = useCustomColumns<PaymentTerm>("paymentTerm");

  const columns = useMemo<ColumnDef<PaymentTerm>[]>(() => {
    const defaultColumns: ColumnDef<PaymentTerm>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Hyperlink to={`${row.original.id}?${params.toString()}`}>
            {row.original.name}
          </Hyperlink>
        ),
      },
      {
        accessorKey: "daysDue",
        header: "Days Due",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "daysDiscount",
        header: "Days Discount",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "discountPercentage",
        header: "Discount Percentage",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "calculationMethod",
        header: "Calculation Method",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
        meta: {
          filter: {
            type: "static",
            options: paymentTermsCalculationMethod.map((v) => ({
              label: <Enumerable value={v} />,
              value: v,
            })),
          },
        },
      },
    ];
    return [...defaultColumns, ...customColumns];
  }, [params, customColumns]);

  const renderContextMenu = useCallback(
    (row: PaymentTerm) => {
      return (
        <>
          <MenuItem
            disabled={!permissions.can("update", "accounting")}
            onClick={() => {
              navigate(`${path.to.paymentTerm(row.id)}?${params.toString()}`);
            }}
          >
            <MenuIcon icon={<LuPencil />} />
            Edit Payment Term
          </MenuItem>
          <MenuItem
            disabled={!permissions.can("delete", "accounting")}
            onClick={() => {
              navigate(
                `${path.to.deletePaymentTerm(row.id)}?${params.toString()}`
              );
            }}
          >
            <MenuIcon icon={<LuTrash />} />
            Delete Payment Term
          </MenuItem>
        </>
      );
    },
    [navigate, params, permissions]
  );

  return (
    <Table<PaymentTerm>
      data={data}
      columns={columns}
      count={count}
      primaryAction={
        permissions.can("create", "accounting") && (
          <New label="Payment Term" to={`new?${params.toString()}`} />
        )
      }
      renderContextMenu={renderContextMenu}
    />
  );
});

PaymentTermsTable.displayName = "PaymentTermsTable";
export default PaymentTermsTable;
