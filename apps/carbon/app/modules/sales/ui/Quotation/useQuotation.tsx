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

type Effect = (quantity: number) => number;

type LinePriceEffects = {
  materialCost: Effect[];
  laborCost: Effect[];
  overheadCost: Effect[];
  setupHours: Effect[];
  productionHours: Effect[];
};

const $quotationStore = atom<Quote>({
  quote: undefined,
  lines: [],
  assemblies: [],
  operations: [],
  materials: [],
});

const defaultEffects: LinePriceEffects = {
  materialCost: [],
  laborCost: [],
  overheadCost: [],
  setupHours: [],
  productionHours: [],
};

const $quotationLinePriceEffects = computed($quotationStore, (store: Quote) => {
  // vroom vroom
  if (!store.quote) return [];
  let linePriceEffects: Record<string, LinePriceEffects> = Object.create(null);

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

  store.lines?.forEach((line) => {
    linePriceEffects[line.id] = defaultEffects;

    let assembliesById = assembliesByLineId[line.id]?.reduce<
      Record<string, QuotationAssembly>
    >((acc, assembly) => {
      acc[assembly.id] = assembly;
      return acc;
    }, {});

    let extendedQuantitiesPerAssembly: Record<string, number> = {};

    assembliesByLineId[line.id]?.forEach((assembly: QuotationAssembly) => {
      let quantity = assembly.quantityPerParent ?? 1;
      let asm = assembliesById[assembly.id];
      while (asm.parentAssemblyId) {
        // memoize the results
        if (extendedQuantitiesPerAssembly[asm.parentAssemblyId]) {
          quantity *= extendedQuantitiesPerAssembly[asm.parentAssemblyId];
          break;
        }

        let parent = assembliesById[asm.parentAssemblyId];
        quantity *= parent.quantityPerParent ?? 1;
        asm = parent;
      }

      extendedQuantitiesPerAssembly[assembly.id] = quantity;
    });

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

      linePriceEffects[line.id].materialCost.push((quantity) => {
        return materialCost * quantity * extendedQuantityPerAssembly;
      });

      if (operation.setupHours) {
        linePriceEffects[line.id].setupHours.push((_quantity) => {
          return operation.setupHours;
        });
        if (operation.quotingRate) {
          linePriceEffects[line.id].overheadCost.push((_quantity) => {
            return operation.setupHours * (operation.quotingRate ?? 0);
          });
        } else {
          linePriceEffects[line.id].laborCost.push((_quantity) => {
            return operation.setupHours * (operation.laborRate ?? 0);
          });
          linePriceEffects[line.id].overheadCost.push((_quantity) => {
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
          linePriceEffects[line.id].productionHours.push((_quantity) => {
            return hoursPerProductionStandard;
          });
          if (operation.quotingRate) {
            linePriceEffects[line.id].overheadCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.quotingRate ?? 0);
            });
          } else {
            linePriceEffects[line.id].laborCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.laborRate ?? 0);
            });
            linePriceEffects[line.id].overheadCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.overheadRate ?? 0);
            });
          }
        } else {
          linePriceEffects[line.id].productionHours.push((quantity) => {
            return (
              hoursPerProductionStandard *
              quantity *
              extendedQuantityPerAssembly
            );
          });
          if (operation.quotingRate) {
            linePriceEffects[line.id].overheadCost.push((quantity) => {
              return (
                hoursPerProductionStandard *
                quantity *
                extendedQuantityPerAssembly *
                (operation.quotingRate ?? 0)
              );
            });
          } else {
            linePriceEffects[line.id].laborCost.push((quantity) => {
              return (
                hoursPerProductionStandard *
                quantity *
                extendedQuantityPerAssembly *
                (operation.laborRate ?? 0)
              );
            });
            linePriceEffects[line.id].overheadCost.push((quantity) => {
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
  });
  return linePriceEffects;
});

export const useQuotation = () => useNanoStore<Quote>($quotationStore);
export const useQuotationLinePriceEffects = () =>
  useValue($quotationLinePriceEffects);
