import { Button, cn, HStack, IconButton } from "@carbon/react";
import type { Params } from "@remix-run/react";
import { Link, useLocation, useParams } from "@remix-run/react";
import { useState } from "react";
import { AiOutlinePartition } from "react-icons/ai";
import { HiOutlineCube } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";
import { LuClock } from "react-icons/lu";
import { RxChevronDown } from "react-icons/rx";
import type { BillOfMaterialNode } from "~/modules/shared";
import { path } from "~/utils/path";
import { useQuotationMenu } from "./useQuotation";

const QuotationExplorerItem = (
  node: Omit<BillOfMaterialNode, "children"> & {
    params: Params<string>;
    pathname: string;
  }
) => {
  const { type, id, parentId, label, meta, params, pathname } = node;
  let isActive = false;
  switch (type) {
    case "assemblies":
      return (
        <Button
          variant="ghost"
          className="w-full justify-between text-muted-foreground"
          asChild
        >
          <Link to={path.to.newQuoteAssembly(params.id!, id, parentId)}>
            <span>{label}</span>
            <IoMdAdd />
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
          >
            <span>{label}</span>
            <IoMdAdd />
          </Link>
        </Button>
      );
    case "operations":
      return (
        <Button
          variant="ghost"
          className="w-full justify-between text-muted-foreground"
          asChild
        >
          <Link to={path.to.newQuoteOperation(params.id!, id, parentId)}>
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
          <Link to={path.to.quoteLine(params.id!, id)} prefetch="intent">
            <span className="flex justify-start">
              <AiOutlinePartition className="w-4 h-4 mr-2" />
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
          >
            {label}
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
          >
            {label}
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
    case "parent":
      isActive = pathname === path.to.quoteDetails(id);
      return (
        <Button
          variant={isActive ? "primary" : "ghost"}
          className="flex-1 justify-start"
          asChild
        >
          <Link to={path.to.quote(params.id!)} prefetch="intent">
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
  const { pathname } = useLocation();
  const params = useParams();
  if (!params.id) throw new Error("id not found");

  const menu = useQuotationMenu() as BillOfMaterialNode[];

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [params.id]: true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderBillOfMaterial = (
    menu: BillOfMaterialNode[],
    level: number = 0
  ) => {
    return menu.map((node) => {
      return (
        <div className="w-full" role="group" key={`${node.id}-${node.type}`}>
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
              pathname={pathname}
              meta={node.meta}
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
      {renderBillOfMaterial(menu)}
    </div>
  );
};

export default QuotationExplorer;
