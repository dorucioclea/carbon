import { Button, cn, HStack, IconButton } from "@carbon/react";
import type { Params } from "@remix-run/react";
import { Link, useLocation, useParams } from "@remix-run/react";
import { arrayToTree } from "performant-array-to-tree";
import { useMemo, useState } from "react";
import { AiOutlinePartition } from "react-icons/ai";
import { HiOutlineCube } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";
import { LuClock } from "react-icons/lu";
import { RxChevronDown } from "react-icons/rx";
import type { BillOfMaterialNode } from "~/modules/shared";
import { path } from "~/utils/path";
import type { QuotationMaterial } from "../..";
import { useQuotation } from "./useQuotation";

const QuotationExplorerItem = (
  node: Omit<BillOfMaterialNode, "children"> & {
    params: Params<string>;
    pathname: string;
    onClick: () => void;
  }
) => {
  const { type, id, parentId, label, meta, params, pathname, onClick } = node;
  let isActive = false;
  switch (type) {
    case "assembly":
      isActive =
        pathname ===
        path.to.quoteAssembly(params.id!, meta.quoteLineId, meta.id);
      return (
        <Button
          leftIcon={<AiOutlinePartition />}
          variant={isActive ? "primary" : "ghost"}
          className="flex-1 justify-start"
          asChild
        >
          <Link
            to={path.to.quoteAssembly(params.id!, meta.quoteLineId, meta.id)}
            prefetch="intent"
            onClick={onClick}
          >
            {label}
          </Link>
        </Button>
      );
    case "assemblies":
      isActive =
        pathname ===
        path.to.newQuoteAssembly(meta.quoteId, meta.quoteLineId, parentId);
      return (
        <Button
          variant={isActive ? "primary" : "ghost"}
          className={cn(
            "w-full justify-between",
            !isActive && "text-muted-foreground"
          )}
          asChild
        >
          <Link
            to={path.to.newQuoteAssembly(
              meta.quoteId,
              meta.quoteLineId,
              parentId
            )}
            onClick={onClick}
          >
            <span>{label}</span>
            <IoMdAdd />
          </Link>
        </Button>
      );
    case "line":
      isActive = pathname === path.to.quoteLine(params.id!, id);

      return (
        <Button
          variant={isActive ? "primary" : "ghost"}
          className="flex-1 justify-between"
          asChild
        >
          <Link
            to={path.to.quoteLine(params.id!, id)}
            prefetch="intent"
            onClick={onClick}
          >
            <span className="flex items-center justify-start">
              {meta.replenishmentSystem === "Buy" ? (
                <HiOutlineCube className="w-4 h-4 mr-2" />
              ) : (
                <AiOutlinePartition className="w-4 h-4 mr-2" />
              )}
              {label}
            </span>
            <span
              className={cn(
                "rounded-full h-2 w-2 inline-block ml-2",
                meta?.status === "Complete" && "bg-green-500",
                meta?.status === "In Progress" && "bg-orange-500",
                meta?.status === "Draft" && "bg-zinc-500"
              )}
            />
          </Link>
        </Button>
      );

    case "material":
      return (
        <Button
          leftIcon={<HiOutlineCube />}
          variant="ghost"
          className="flex-1 justify-start"
          asChild
        >
          <Link
            to={path.to.quoteOperation(params.id!, meta.quoteLineId, parentId!)}
          >
            {label}
          </Link>
        </Button>
      );

    case "materials":
      return (
        <Button
          variant="ghost"
          className="w-full justify-between text-muted-foreground"
          asChild
        >
          <Link
            to={path.to.newQuoteMaterial(params.id!, meta.quoteLineId, meta.id)}
            onClick={onClick}
          >
            <span>{label}</span>
            <IoMdAdd />
          </Link>
        </Button>
      );
    case "operations":
      isActive =
        pathname ===
        path.to.newQuoteOperation(meta.quoteId, meta.quoteLineId, parentId);
      return (
        <Button
          variant={isActive ? "primary" : "ghost"}
          className={cn(
            "w-full justify-between",
            !isActive && "text-muted-foreground"
          )}
          asChild
        >
          <Link
            to={path.to.newQuoteOperation(
              meta.quoteId,
              meta.quoteLineId,
              parentId
            )}
            onClick={onClick}
          >
            <span>{label}</span>
            <IoMdAdd />
          </Link>
        </Button>
      );

    case "operation":
      isActive = [
        path.to.quoteOperation(params.id!, meta.quoteLineId, meta.id),
        path.to.newQuoteMaterial(params.id!, meta.quoteLineId, meta.id),
      ].includes(pathname);
      return (
        <Button
          leftIcon={<LuClock />}
          variant={isActive ? "primary" : "ghost"}
          className="flex-1 justify-start"
          asChild
        >
          <Link
            to={path.to.quoteOperation(params.id!, meta.quoteLineId, meta.id)}
            prefetch="intent"
            onClick={onClick}
          >
            {label}
          </Link>
        </Button>
      );
    case "parent":
      isActive = pathname === path.to.quoteDetails(id);
      return (
        <Button
          variant={isActive ? "primary" : "ghost"}
          className="flex-1 justify-start"
          asChild
        >
          <Link
            to={path.to.quote(params.id!)}
            prefetch="intent"
            onClick={onClick}
          >
            {label}
          </Link>
        </Button>
      );
    default:
      throw new Error(
        `unknown type: ${type} for node: ${JSON.stringify(node, null, 2)}`
      );
  }
};

const QuotationExplorer = () => {
  const { pathname, search } = useLocation();

  const params = useParams();
  if (!params.id) throw new Error("id not found");

  const [quote] = useQuotation();

  const tree = useMemo(() => {
    if (!quote.quote) return [];

    let materialsByOperationId = quote.materials?.reduce<
      Record<string, QuotationMaterial[]>
    >((acc, material) => {
      if (!acc[material.quoteOperationId]) {
        acc[material.quoteOperationId] = [];
      }
      acc[material.quoteOperationId].push(material);
      return acc;
    }, {});

    let operationsByAssemblyId = quote.operations?.reduce<
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

    const assembliesByLineId = quote.assemblies?.reduce<
      Record<string, BillOfMaterialNode[]>
    >((acc, assembly) => {
      if (!acc[assembly.quoteLineId]) {
        acc[assembly.quoteLineId] = [];
      }
      acc[assembly.quoteLineId].push({
        id: assembly.id,
        parentId: assembly.parentAssemblyId ?? undefined,
        label: assembly.description ?? assembly.partId,
        type: "assembly",
        meta: assembly,
      });
      return acc;
    }, {});

    const operationsByLineId = quote.operations?.reduce<
      Record<string, BillOfMaterialNode[]>
    >((acc, operation) => {
      if (!acc[operation.quoteLineId]) {
        acc[operation.quoteLineId] = [];
      }
      acc[operation.quoteLineId].push({
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

    let tree: BillOfMaterialNode[] = [
      {
        id: quote.quote.id!,
        label: quote.quote.quoteId!,
        type: "parent",
        children: quote.lines?.map<BillOfMaterialNode>((line) => ({
          id: line.id,
          label: line.description,
          type: "line",
          meta: line,
          children:
            line.replenishmentSystem === "Make"
              ? [
                  {
                    id: `${line.id}-assemblies`,
                    label: "Assemblies",
                    type: "assemblies",
                    children: assembliesByLineId[line.id]
                      ? [
                          ...(arrayToTree([...assembliesByLineId[line.id]], {
                            id: "id",
                            dataField: null,
                          }) as BillOfMaterialNode[]),
                        ]
                      : [],
                    meta: {
                      quoteId: line.quoteId,
                      quoteLineId: line.id,
                    },
                  },
                  {
                    id: `${line.id}-operations`,
                    label: "Operations",
                    type: "operations",
                    children: operationsByLineId[line.id]
                      ? [...operationsByLineId[line.id]]?.filter(
                          (operation) => operation.parentId === undefined
                        )
                      : ([] as BillOfMaterialNode[]),
                    meta: {
                      quoteId: line.quoteId,
                      quoteLineId: line.id,
                    },
                  },
                ]
              : undefined,
        })),
      },
    ];

    traverseTree(tree, (node) => {
      if (node.type === "assembly") {
        let currentChildren = node.children ? [...node.children] : [];
        node.children = [
          {
            id: `${node.id}-assemblies`,
            parentId: node.id,
            label: "Assemblies",
            type: "assemblies",
            children: currentChildren,
            meta: {
              quoteId: node.meta.quoteId,
              quoteLineId: node.meta.quoteLineId,
            },
          },
          {
            id: `${node.id}-operations`,
            parentId: node.id,
            label: "Operations",
            type: "operations",
            children: operationsByAssemblyId[node.id]
              ? [...operationsByAssemblyId[node.id]]
              : [],
            meta: {
              quoteId: node.meta.quoteId,
              quoteLineId: node.meta.quoteLineId,
            },
          },
        ];
      }
    });

    return tree;
  }, [quote]);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [params.id]: true,
  });

  const openNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderBillOfMaterial = (
    tree: BillOfMaterialNode[],
    level: number = 0
  ) => {
    return tree.map((node) => {
      return (
        <div className="w-full" role="group" key={`${node.id}:${node.type}`}>
          <HStack
            className="items-stretch w-full"
            spacing={0}
            style={{
              paddingLeft: `calc(${0.5 * level}rem)`,
            }}
          >
            <IconButton
              aria-label={expandedNodes[node.id] ? "Collapse" : "Expand"}
              onClick={() => toggleNode(node.id)}
              isDisabled={!node.children}
              icon={<RxChevronDown />}
              style={{
                transition: "transform .25s ease",
                transform:
                  expandedNodes[node.id] ||
                  !node.children ||
                  node.children?.length === 0
                    ? undefined
                    : "rotate(-0.25turn)",
              }}
              variant="ghost"
            />
            <QuotationExplorerItem
              type={node.type}
              id={node.id}
              label={node.label}
              parentId={node.parentId}
              params={params}
              pathname={pathname + search}
              meta={node.meta}
              onClick={() => openNode(node.id)}
            />
          </HStack>
          {node.children &&
            expandedNodes[node.id] &&
            renderBillOfMaterial(node.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full overflow-auto" role="tree">
      {renderBillOfMaterial(tree)}
    </div>
  );
};

export default QuotationExplorer;

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
