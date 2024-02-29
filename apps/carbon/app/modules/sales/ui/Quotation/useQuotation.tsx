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

const $quotationStore = atom<Quote>({
  quote: undefined,
  lines: [],
  assemblies: [],
  operations: [],
  materials: [],
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
      itemsByLineId[assembly.quoteLineId] = {
        assemblies: [],
        operations: [],
      };
    }
    itemsByLineId[assembly.quoteLineId].assemblies.push({
      id: assembly.id,
      parentId: assembly.parentAssemblyId ?? undefined,
      label: assembly.description,
      type: "assembly",
      meta: assembly,
    });
  });

  store.operations.forEach((operation) => {
    if (!itemsByLineId[operation.quoteLineId]) {
      itemsByLineId[operation.quoteLineId] = {
        assemblies: [],
        operations: [],
      };
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
