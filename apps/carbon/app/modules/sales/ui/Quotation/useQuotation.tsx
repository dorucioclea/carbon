import { atom } from "nanostores";
import { useNanoStore } from "~/hooks";
import type {
  QuotationAssembly,
  QuotationLine,
  QuotationMaterial,
  QuotationOperation,
} from "~/modules/sales";

type Quote = {
  lines: QuotationLine[];
  assemblies: QuotationAssembly[];
  operations: QuotationOperation[];
  materials: QuotationMaterial[];
};

const $quotationStore = atom<Quote>({
  lines: [],
  assemblies: [],
  operations: [],
  materials: [],
});

export const useQuotation = () => useNanoStore<Quote>($quotationStore);
