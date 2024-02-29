import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HStack,
  IconButton,
} from "@carbon/react";
import { Form, Outlet, useNavigate, useParams } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef } from "react";
import { IoMdTrash } from "react-icons/io";
import { MdMoreHoriz } from "react-icons/md";
import { EditableNumber } from "~/components/Editable";
import Grid from "~/components/Grid";
import { usePermissions, useUser } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import {
  useQuotation,
  type QuotationLine,
  type QuotationLineQuantity,
} from "~/modules/sales";
import { path } from "~/utils/path";
import { useQuotationLinePriceEffects } from "./useQuotation";

type QuotationLineQuantitiesProps = {
  quotationLine: QuotationLine;
  quotationLineQuantities: QuotationLineQuantity[];
};

const QuotationLineQuantities = ({
  quotationLine,
  quotationLineQuantities,
}: QuotationLineQuantitiesProps) => {
  const { id, lineId } = useParams();
  if (!id) throw new Error("id not found");
  if (!lineId) throw new Error("lineId not found");

  const navigate = useNavigate();

  const [quotation] = useQuotation();
  const lineEffects = useQuotationLinePriceEffects();

  // TODO: use the currency of the quote
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const { id: userId } = useUser();
  const { supabase } = useSupabase();
  const permissions = usePermissions();

  const canEdit = permissions.can("update", "sales");
  const canDelete = permissions.can("delete", "sales");

  const onCellEdit = useCallback(
    async (id: string, value: unknown, row: QuotationLineQuantity) => {
      if (!supabase) throw new Error("Supabase client not found");
      return await supabase
        .from("quoteLineQuantity")
        .update({
          [id]: value,
          updatedBy: userId,
        })
        .eq("id", row.id!);
    },
    [supabase, userId]
  );

  const isEditable = ["Draft"].includes(quotation?.quote?.status ?? "");
  const isMade = quotationLine.replenishmentSystem === "Make";

  const columns = useMemo<ColumnDef<QuotationLineQuantity>[]>(() => {
    const _columns: ColumnDef<QuotationLineQuantity>[] = [
      {
        header: "Line",
        cell: ({ row }) => (
          <HStack className="justify-between">
            <span>{row.index + 1}</span>
            <div className="relative w-6 h-5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    aria-label="Edit quotation line"
                    icon={<MdMoreHoriz />}
                    size="md"
                    className="absolute right-[-1px] top-[-6px]"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => navigate(`${row.original.id}/delete`)}
                    disabled={!isEditable || !canDelete}
                  >
                    <DropdownMenuIcon icon={<IoMdTrash />} />
                    Delete Line
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </HStack>
        ),
      },

      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "unitCostBase",
        header: "Unit Cost",
        cell: ({ row }) => formatter.format(getUnitCost(row.original)),
      },
      {
        accessorKey: "unitTaxAmount",
        header: "Unit Tax",
        cell: (item) => formatter.format(item.getValue<number>()),
      },
      {
        header: "Extended Cost",
        cell: ({ row }) =>
          formatter.format(
            row.original.quantity *
              (getUnitCost(row.original) + row.original.unitTaxAmount)
          ),
      },
      {
        accessorKey: "markupPercentage",
        header: "Markup %",
        cell: (item) => item.getValue() + "%",
      },
      {
        accessorKey: "discountPercentage",
        header: "Discount %",
        cell: (item) => item.getValue() + "%",
      },
      {
        header: "Extended Price",
        cell: ({ row }) =>
          formatter.format(
            row.original.quantity *
              (getUnitCost(row.original) + row.original.unitTaxAmount) *
              (1 - row.original.discountPercentage / 100) *
              (1 + row.original.markupPercentage / 100)
          ),
      },
      {
        accessorKey: "leadTime",
        header: "Lead Time",
        cell: (item) => item.getValue(),
      },
    ];

    if (isMade) {
      _columns.push(
        {
          accessorKey: "scrapPercentage",
          header: "Scrap Percentage",
          cell: (item) => item.getValue() + "%",
        },
        {
          accessorKey: "setupHours",
          header: "Setup Hours",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "productionHours",
          header: "Production Hours",
          cell: (item) => item.getValue(),
        }
      );
    }

    _columns.push({
      accessorKey: "materialCost",
      header: "Material Cost",
      cell: (item) => formatter.format(item.getValue<number>()),
    });

    if (isMade) {
      _columns.push(
        {
          accessorKey: "laborCost",
          header: "Labor Cost",
          cell: (item) => formatter.format(item.getValue<number>()),
        },
        {
          accessorKey: "overheadCost",
          header: "Overhead Cost",
          cell: (item) => formatter.format(item.getValue<number>()),
        },
        {
          accessorKey: "additionalCost",
          header: "Additional Cost",
          cell: (item) => formatter.format(item.getValue<number>()),
        }
      );
    }

    return _columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, quotationLine.replenishmentSystem, isEditable, canDelete]);

  const editableComponents = useMemo(
    () => ({
      quantity: EditableNumber(onCellEdit),
      scrapPercentage: EditableNumber(onCellEdit, {
        minValue: 0,
        maxValue: 1,
      }),
      setupHours: EditableNumber(onCellEdit, { minValue: 0 }),
      productionHours: EditableNumber(onCellEdit, { minValue: 0 }),
      materialCost: EditableNumber(onCellEdit, { minValue: 0 }),
      laborCost: EditableNumber(onCellEdit, { minValue: 0 }),
      overheadCost: EditableNumber(onCellEdit, { minValue: 0 }),
      additionalCost: EditableNumber(onCellEdit, { minValue: 0 }),
      discountPercentage: EditableNumber(onCellEdit, { minValue: 0 }),
      markupPercentage: EditableNumber(onCellEdit, { minValue: 0 }),
      unitTaxAmount: EditableNumber(onCellEdit, { minValue: 0 }),
      leadTime: EditableNumber(onCellEdit, { minValue: 0 }),
    }),
    [onCellEdit]
  );

  const newRowButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Card
        className="w-full"
        style={{ height: 196 + quotationLineQuantities.length * 44 }}
      >
        <HStack className="justify-between items-start">
          <CardHeader>
            <CardTitle>Line Prices</CardTitle>
          </CardHeader>
        </HStack>

        <CardContent>
          <Grid<QuotationLineQuantity>
            data={quotationLineQuantities}
            canEdit={canEdit && isEditable}
            columns={columns}
            editableComponents={editableComponents}
            onNewRow={
              canEdit && isEditable
                ? () => newRowButtonRef.current?.click()
                : undefined
            }
          />
          <Form method="post" action={path.to.newQuoteLineQuantity(id, lineId)}>
            <button type="submit" ref={newRowButtonRef} className="sr-only" />
          </Form>
        </CardContent>
      </Card>
      <Outlet />
    </>
  );
};

export default QuotationLineQuantities;

function getUnitCost(quantity: QuotationLineQuantity) {
  return (
    quantity.materialCost +
    quantity.laborCost +
    quantity.overheadCost +
    quantity.additionalCost
  );
}
