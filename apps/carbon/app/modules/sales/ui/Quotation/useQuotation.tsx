import { useStore as useValue } from "@nanostores/react";
import { atom, computed } from "nanostores";
import { useNanoStore } from "~/hooks";
import type {
  Quotation,
  QuotationAssembly,
  QuotationLine,
  QuotationMaterial,
  QuotationOperation,
} from "~/modules/sales";

type Quote = {
  quote?: Quotation;
  lines: QuotationLine[];
  assemblies: QuotationAssembly[];
  operations: QuotationOperation[];
  materials: QuotationMaterial[];
};

const $quotationStore = atom<Quote>({
  quote: undefined,
  lines: [],
  assemblies: [],
  operations: [],
  materials: [],
});

const $quotationMenuStore = computed($quotationStore, (store) => {
  if (!store.quote) return [];
  const menu = [
    {
      id: store.quote.id,
      label: store.quote.quoteId,
      type: "parent",
      children: store.lines.map((line) => ({
        id: line.id,
        label: line.partId,
        type: "line",
        meta: line,
      })),
    },
  ];

  return menu;
});

export const useQuotation = () => useNanoStore<Quote>($quotationStore);
export const useQuotationMenu = () => useValue($quotationMenuStore);
