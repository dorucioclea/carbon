import { useStore as useValue } from "@nanostores/react";
import { atom, computed } from "nanostores";
import { arrayToTree } from "performant-array-to-tree";
import { useNanoStore } from "~/hooks";
import type {
  Quotation,
  QuotationAssembly,
  QuotationLine,
  QuotationMaterial,
  QuotationOperation,
} from "~/modules/sales";
import type { BillOfMaterialNode } from "~/modules/shared";

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

const defaultItems = {
  assemblies: [],
  operations: [],
};

const defaultEffects = {
  materialCost: [],
  laborCost: [],
  overheadCost: [],
  setupHours: [],
  productionHours: [],
};

const $quotationLinePriceEffects = computed($quotationStore, (store: Quote) => {
  // vroom vroom
  if (!store.quote) return [];
  let linePriceEffects: Record<string, LinePriceEffects> = {};

  let itemsByLineId: Record<
    string,
    {
      assemblies: QuotationAssembly[];
      operations: QuotationOperation[];
    }
  > = {};

  store.assemblies.forEach((assembly) => {
    if (!itemsByLineId[assembly.quoteLineId]) {
      itemsByLineId[assembly.quoteLineId] = defaultItems;
    }
    itemsByLineId[assembly.quoteLineId].assemblies.push(assembly);
  });

  store.operations.forEach((operation) => {
    if (!itemsByLineId[operation.quoteLineId]) {
      itemsByLineId[operation.quoteLineId] = defaultItems;
    }
    itemsByLineId[operation.quoteLineId].operations.push(operation);
  });

  let materialsByOperationId = store.materials.reduce<
    Record<string, QuotationMaterial[]>
  >((acc, material) => {
    if (!acc[material.quoteOperationId]) {
      acc[material.quoteOperationId] = [];
    }
    acc[material.quoteOperationId].push(material);
    return acc;
  }, {});

  store.lines.forEach((line) => {
    linePriceEffects[line.id] = defaultEffects;

    let assembliesById = itemsByLineId[line.id].assemblies.reduce<
      Record<string, QuotationAssembly>
    >((acc, assembly) => {
      acc[assembly.id] = assembly;
      return acc;
    }, {});

    let extendedQuantitiesPerAssembly: Record<string, number> = {};

    itemsByLineId[line.id].assemblies.forEach((assembly: QuotationAssembly) => {
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

    itemsByLineId[line.id].operations.forEach(
      (operation: QuotationOperation) => {
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
          linePriceEffects[line.id].laborCost.push((_quantity) => {
            return operation.setupHours * (operation.laborRate ?? 0);
          });
          linePriceEffects[line.id].overheadCost.push((_quantity) => {
            return operation.setupHours * (operation.overheadRate ?? 0);
          });
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
            linePriceEffects[line.id].laborCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.laborRate ?? 0);
            });
            linePriceEffects[line.id].overheadCost.push((_quantity) => {
              return hoursPerProductionStandard * (operation.overheadRate ?? 0);
            });
          } else {
            linePriceEffects[line.id].productionHours.push((quantity) => {
              return (
                hoursPerProductionStandard *
                quantity *
                extendedQuantityPerAssembly
              );
            });
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
    );
  });
  return linePriceEffects;
});

const $quotationMenuStore = computed($quotationStore, (store: Quote) => {
  if (!store.quote) return [];

  let materialsByOperationId = store.materials.reduce<
    Record<string, QuotationMaterial[]>
  >((acc, material) => {
    if (!acc[material.quoteOperationId]) {
      acc[material.quoteOperationId] = [];
    }
    acc[material.quoteOperationId].push(material);
    return acc;
  }, {});

  let operationsByAssemblyId = store.operations.reduce<
    Record<string, BillOfMaterialNode[]>
  >((acc, operation) => {
    if (!operation?.quoteAssemblyId) return acc;
    if (!acc[operation.quoteAssemblyId]) {
      acc[operation.quoteAssemblyId] = [];
    }
    acc[operation.quoteAssemblyId].push({
      id: operation.id,
      parentId: operation.quoteAssemblyId ?? undefined,
      label: operation.description ?? "Operation",
      type: "operation",
      meta: operation,
      children: [
        {
          id: operation.id,
          label: "Materials",
          type: "materials",
          meta: operation,
          children: materialsByOperationId[operation.id]?.map((material) => ({
            id: material.id,
            parentId: operation.id,
            label: material.description,
            type: "material",
            meta: material,
          })),
        },
      ],
    });
    return acc;
  }, {});

  let itemsByLineId: Record<
    string,
    {
      assemblies: BillOfMaterialNode[];
      operations: BillOfMaterialNode[];
    }
  > = {};

  store.assemblies.forEach((assembly) => {
    if (!itemsByLineId[assembly.quoteLineId]) {
      itemsByLineId[assembly.quoteLineId] = defaultItems;
    }
    itemsByLineId[assembly.quoteLineId].assemblies.push({
      id: assembly.id,
      parentId: assembly.parentAssemblyId ?? undefined,
      label: assembly.description ?? assembly.partId,
      type: "assembly",
      meta: assembly,
    });
  });

  store.operations.forEach((operation) => {
    if (!itemsByLineId[operation.quoteLineId]) {
      itemsByLineId[operation.quoteLineId] = defaultItems;
    }
    itemsByLineId[operation.quoteLineId].operations.push({
      id: operation.id,
      parentId: operation.quoteAssemblyId ?? undefined,
      label: operation.description ?? "Operation",
      type: "operation",
      meta: operation,
      children: [
        {
          id: `${operation.id}-materials`,
          label: "Materials",
          type: "materials",
          meta: operation,
          children: materialsByOperationId[operation.id]?.map((material) => ({
            id: material.id,
            parentId: operation.id,
            label: material.description,
            type: "material",
            meta: material,
          })),
        },
      ],
    });
  });

  let menu: BillOfMaterialNode[] = [
    {
      id: store.quote.id!,
      label: store.quote.quoteId!,
      type: "parent",
      children: store.lines.map<BillOfMaterialNode>((line) => ({
        id: line.id,
        label: line.description,
        type: "line",
        meta: line,
        children: [
          {
            id: `${line.id}-assemblies`,
            label: "Assemblies",
            type: "assemblies",
            children: itemsByLineId[line.id]?.assemblies
              ? [
                  ...(arrayToTree(itemsByLineId[line.id].assemblies, {
                    id: "id",
                    dataField: null,
                  }) as BillOfMaterialNode[]),
                ]
              : [],
            meta: line,
          },
          {
            id: `${line.id}-operations`,
            label: "Operations",
            type: "operations",
            children: itemsByLineId[line.id]?.operations.filter(
              (operation) => operation.parentId === undefined
            ) as BillOfMaterialNode[],
            meta: line,
          },
        ],
      })),
    },
  ];

  traverseTree(menu, (node) => {
    if (node.type === "assembly") {
      let currentChildren = node.children ? [...node.children] : [];
      node.children = [
        {
          id: `${node.id}-assemblies`,
          parentId: node.id,
          label: "Assemblies",
          type: "assemblies",
          children: currentChildren,
          meta: node.meta,
        },
        {
          id: `${node.id}-operations`,
          parentId: node.id,
          label: "Operations",
          type: "operations",
          children: operationsByAssemblyId[node.id] ?? [],
          meta: node.meta,
        },
      ];
    }
  });

  return menu;
});

function traverseTree(
  tree: BillOfMaterialNode[],
  callback: (node: BillOfMaterialNode) => void
) {
  tree.forEach((node) => {
    callback(node);
    if (node.children) {
      traverseTree(node.children, callback);
    }
  });
}

export const useQuotation = () => useNanoStore<Quote>($quotationStore);
export const useQuotationMenu = () => useValue($quotationMenuStore);
export const useQuotationLinePriceEffects = () =>
  useValue($quotationLinePriceEffects);
