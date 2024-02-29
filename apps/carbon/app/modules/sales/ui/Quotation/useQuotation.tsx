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

const $quotationLinePriceEffects = computed($quotationStore, (store: Quote) => {
  // vroom vroom
  if (!store.quote) return [];
  const linePriceEffects: Record<string, LinePriceEffects> = {};

  const itemsByLineId: Record<
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

  const materialsByOperationId = store.materials.reduce<
    Record<string, QuotationMaterial[]>
  >((acc, material) => {
    if (!acc[material.quoteOperationId]) {
      acc[material.quoteOperationId] = [];
    }
    acc[material.quoteOperationId].push(material);
    return acc;
  }, {});

  store.lines.forEach((line) => {
    linePriceEffects[line.id] = {
      materialCost: [],
      laborCost: [],
      overheadCost: [],
      setupHours: [],
      productionHours: [],
    };

    const assembliesById = itemsByLineId[line.id].assemblies.reduce<
      Record<string, QuotationAssembly>
    >((acc, assembly) => {
      acc[assembly.id] = assembly;
      return acc;
    }, {});

    const extendedQuantitiesPerAssembly: Record<string, number> = {};

    itemsByLineId[line.id].assemblies.forEach((assembly: QuotationAssembly) => {
      let quantity = assembly.quantityPerParent ?? 1;
      let asm = assembliesById[assembly.id];
      while (asm.parentAssemblyId) {
        // memoize the results
        if (extendedQuantitiesPerAssembly[asm.parentAssemblyId]) {
          quantity *= extendedQuantitiesPerAssembly[asm.parentAssemblyId];
          break;
        }

        const parent = assembliesById[asm.parentAssemblyId];
        quantity *= parent.quantityPerParent ?? 1;
        asm = parent;
      }

      extendedQuantitiesPerAssembly[assembly.id] = quantity;
    });

    console.log({ extendedQuantitiesPerAssembly });
  });

  return true;
});

const $quotationMenuStore = computed($quotationStore, (store: Quote) => {
  if (!store.quote) return [];

  const materialsByOperationId = store.materials.reduce<
    Record<string, QuotationMaterial[]>
  >((acc, material) => {
    if (!acc[material.quoteOperationId]) {
      acc[material.quoteOperationId] = [];
    }
    acc[material.quoteOperationId].push(material);
    return acc;
  }, {});

  const operationsByAssemblyId = store.operations.reduce<
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

  const itemsByLineId: Record<
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
  });

  const menu: BillOfMaterialNode[] = [
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
            id: line.id,
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
          },
          {
            id: line.id,
            label: "Operations",
            type: "operations",
            children: itemsByLineId[line.id]?.operations.filter(
              (operation) => operation.parentId === undefined
            ) as BillOfMaterialNode[],
          },
        ],
      })),
    },
  ];

  traverseTree(menu, (node) => {
    if (node.type === "assembly") {
      node.children = [
        {
          id: node.meta.quoteLineId,
          parentId: node.id,
          label: "Assemblies",
          type: "assemblies",
          children: node.children,
        },
        {
          id: node.meta.quoteLineId,
          parentId: node.id,
          label: "Operations",
          type: "operations",
          children: operationsByAssemblyId[node.id] ?? [],
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
