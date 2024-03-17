import type { Database } from "@carbon/database";

export function getLineDescription(
  line: Database["public"]["Tables"]["quoteLineQuantity"]["Row"]
) {
  return line?.quantity;
}

export function getExtendedPrice(
  line: Database["public"]["Tables"]["quoteLineQuantity"]["Row"]
) {
  return (
    line?.quantity *
    (getUnitCost(line) + line.unitTaxAmount) *
    (1 - line.discountPercentage / 100) *
    (1 + line.markupPercentage / 100)
  );
}

export function getUnitCost(
  line: Database["public"]["Tables"]["quoteLineQuantity"]["Row"]
) {
  return line.quantity
    ? (line.materialCost +
        line.laborCost +
        line.overheadCost +
        line.additionalCost) /
        line.quantity
    : 0;
}
