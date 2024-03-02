import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { atom, computed } from "nanostores";
import { useNanoStore } from "~/hooks";
import type {
  Quotation,
  QuotationAssembly,
  QuotationLine,
  QuotationMaterial,
  QuotationOperation,
} from "~/modules/sales";

type QuoteStore = {
  client?: SupabaseClient<Database>;
  quote?: Quotation;
  lines: QuotationLine[];
  assemblies: QuotationAssembly[];
  operations: QuotationOperation[];
  materials: QuotationMaterial[];
};

type Effect = (quantity: number) => number;

type LinePriceEffects = {
  materialCost: Effect[];
  laborCost: Effect[];
  overheadCost: Effect[];
  setupHours: Effect[];
  productionHours: Effect[];
};

const $quotationStore = atom<QuoteStore>({
  client: undefined,
  quote: undefined,
  lines: [],
  assemblies: [],
  operations: [],
  materials: [],
});

const $quotationLinePriceEffects = computed($quotationStore, (store) => {
  if (!store.quote || !store.client)
    return {} as Record<string, LinePriceEffects>;

  const assembliesByLineId = store.assemblies?.reduce<
    Record<string, QuotationAssembly[]>
  >((acc, assembly) => {
    if (!acc[assembly.quoteLineId]) {
      acc[assembly.quoteLineId] = [];
    }
    acc[assembly.quoteLineId].push(assembly);
    return acc;
  }, {});

  const operationsByLineId = store.operations?.reduce<
    Record<string, QuotationOperation[]>
  >((acc, operation) => {
    if (!acc[operation.quoteLineId]) {
      acc[operation.quoteLineId] = [];
    }
    acc[operation.quoteLineId].push(operation);
    return acc;
  }, {});

  let materialsByOperationId = store.materials?.reduce<
    Record<string, QuotationMaterial[]>
  >((acc, material) => {
    if (!acc[material.quoteOperationId]) {
      acc[material.quoteOperationId] = [];
    }
    acc[material.quoteOperationId].push(material);
    return acc;
  }, {});

  const linePriceEffects = store?.lines?.reduce<
    Record<string, LinePriceEffects>
  >((effects, line) => {
    effects[line.id] = {
      materialCost: [],
      laborCost: [],
      overheadCost: [],
      setupHours: [],
      productionHours: [],
    };

    let assembliesById = assembliesByLineId[line.id]?.reduce<
      Record<string, QuotationAssembly>
    >((acc, assembly) => {
      acc[assembly.id] = assembly;
      return acc;
    }, {});

    const extendedQuantitiesPerAssembly = assembliesByLineId[line.id]?.reduce<
      Record<string, number>
    >((acc, assembly: QuotationAssembly) => {
      let quantity = assembly.quantityPerParent ?? 1;
      let asm = assembliesById[assembly.id];
      while (asm.parentAssemblyId) {
        // memoize the results
        if (acc[asm.parentAssemblyId]) {
          quantity *= acc[asm.parentAssemblyId];
          break;
        }

        let parent = assembliesById[asm.parentAssemblyId];
        quantity *= parent.quantityPerParent ?? 1;
        asm = parent;
      }

      acc[assembly.id] = quantity;
      return acc;
    }, {});

    operationsByLineId[line.id]?.forEach((operation: QuotationOperation) => {
      let materials = materialsByOperationId[operation.id] ?? [];
      let extendedQuantityPerAssembly = operation.quoteAssemblyId
        ? extendedQuantitiesPerAssembly[operation.quoteAssemblyId] ?? 1
        : 1;

      let materialCost = materials.reduce(
        (acc, material: QuotationMaterial) => {
          return acc + (material.quantity ?? 0) * (material.unitCost ?? 0);
        },
        0
      );

      effects[line.id].materialCost.push((quantity) => {
        return materialCost * quantity * extendedQuantityPerAssembly;
      });

      if (operation.setupHours) {
        effects[line.id].setupHours.push((_quantity) => {
          return operation.setupHours;
        });
        if (operation.quotingRate) {
          effects[line.id].overheadCost.push((_quantity) => {
            return operation.setupHours * (operation.quotingRate ?? 0);
          });
        } else {
          effects[line.id].laborCost.push((_quantity) => {
            return operation.setupHours * (operation.laborRate ?? 0);
          });
          effects[line.id].overheadCost.push((_quantity) => {
            return operation.setupHours * (operation.overheadRate ?? 0);
          });
        }
      }

      if (operation.productionStandard) {
        let hoursPerProductionStandard = 0;
        switch (operation.standardFactor) {
          case "Hours/Piece":
            hoursPerProductionStandard = operation.productionStandard;
            break;
          case "Hours/100 Pieces":
            hoursPerProductionStandard = operation.productionStandard / 100;
            break;
          case "Hours/1000 Pieces":
            hoursPerProductionStandard = operation.productionStandard / 1000;
            break;
          case "Minutes/Piece":
            hoursPerProductionStandard = operation.productionStandard / 60;
            break;
          case "Minutes/100 Pieces":
            hoursPerProductionStandard =
              operation.productionStandard / 100 / 60;
            break;
          case "Minutes/1000 Pieces":
            hoursPerProductionStandard =
              operation.productionStandard / 1000 / 60;
            break;
          case "Pieces/Hour":
            hoursPerProductionStandard = 1 / operation.productionStandard;
            break;
          case "Pieces/Minute":
            hoursPerProductionStandard =
              1 / (operation.productionStandard / 60);
            break;
          case "Seconds/Piece":
            hoursPerProductionStandard = operation.productionStandard / 3600;
            break;
          case "Total Hours":
            hoursPerProductionStandard = operation.productionStandard;
            break;
          case "Total Minutes":
            hoursPerProductionStandard = operation.productionStandard / 60;
            break;
          default:
            break;
        }

        if (
          ["Total Hours", "Total Minutes"].includes(operation.standardFactor)
        ) {
          effects[line.id].productionHours.push((_quantity) => {
            return hoursPerProductionStandard;
          });
          if (operation.quotingRate) {
            effects[line.id].overheadCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.quotingRate ?? 0);
            });
          } else {
            effects[line.id].laborCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.laborRate ?? 0);
            });
            effects[line.id].overheadCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.overheadRate ?? 0);
            });
          }
        } else {
          effects[line.id].productionHours.push((quantity) => {
            return (
              hoursPerProductionStandard *
              quantity *
              extendedQuantityPerAssembly
            );
          });
          if (operation.quotingRate) {
            effects[line.id].overheadCost.push((quantity) => {
              return (
                hoursPerProductionStandard *
                quantity *
                extendedQuantityPerAssembly *
                (operation.quotingRate ?? 0)
              );
            });
          } else {
            effects[line.id].laborCost.push((quantity) => {
              return (
                hoursPerProductionStandard *
                quantity *
                extendedQuantityPerAssembly *
                (operation.laborRate ?? 0)
              );
            });
            effects[line.id].overheadCost.push((quantity) => {
              return (
                hoursPerProductionStandard *
                quantity *
                extendedQuantityPerAssembly *
                (operation.overheadRate ?? 0)
              );
            });
          }
        }
      }
    });
    return effects;
  }, {});

  return linePriceEffects;
});

export const useQuotation = () => useNanoStore<QuoteStore>($quotationStore);
