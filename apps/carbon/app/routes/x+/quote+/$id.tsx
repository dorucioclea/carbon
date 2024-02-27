import {
  Button,
  HStack,
  Heading,
  IconButton,
  Input,
  Menubar,
  MenubarItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  VStack,
  cn,
} from "@carbon/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { CollapsibleSidebar } from "~/components/Layout";
import { getLocationsList } from "~/modules/resources";
import {
  QuotationStatus,
  getQuote,
  getQuoteAssemblies,
  getQuoteExternalDocuments,
  getQuoteInternalDocuments,
  getQuoteLines,
  getQuoteMaterials,
  getQuoteOperations,
  useQuotation,
} from "~/modules/sales";

import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

import { AiOutlinePartition } from "react-icons/ai";
import { HiOutlineCube } from "react-icons/hi";
import { LuClock } from "react-icons/lu";
import { RxChevronDown } from "react-icons/rx";
import { useQuotationMenu } from "~/modules/sales/ui/Quotation/useQuotation";

export const handle: Handle = {
  breadcrumb: "Quotations",
  to: path.to.quotes,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales",
  });

  const { id } = params;
  if (!id) throw new Error("Could not find id");

  const [
    quotation,
    quotationLines,
    quotationAssemblies,
    quotationMaterials,
    quotationOperations,
    externalDocuments,
    internalDocuments,
    locations,
  ] = await Promise.all([
    getQuote(client, id),
    getQuoteLines(client, id),
    getQuoteAssemblies(client, id),
    getQuoteMaterials(client, id),
    getQuoteOperations(client, id),
    getQuoteExternalDocuments(client, id),
    getQuoteInternalDocuments(client, id),
    getLocationsList(client),
  ]);

  if (quotation.error) {
    return redirect(
      path.to.quotes,
      await flash(
        request,
        error(quotation.error, "Failed to load quotation summary")
      )
    );
  }

  return json({
    quotation: quotation.data,
    quotationLines: quotationLines.data ?? [],
    quotationAssemblies: quotationAssemblies.data ?? [],
    quotationMaterials: quotationMaterials.data ?? [],
    quotationOperations: quotationOperations.data ?? [],
    externalDocuments: externalDocuments.data ?? [],
    internalDocuments: internalDocuments.data ?? [],
    locations: locations.data ?? [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  return redirect(request.headers.get("Referer") ?? request.url);
}

export default function QuotationRoute() {
  const {
    quotation,
    quotationLines,
    quotationAssemblies,
    quotationMaterials,
    quotationOperations,
  } = useLoaderData<typeof loader>();
  const [, setQuotation] = useQuotation();

  useEffect(() => {
    setQuotation({
      quote: quotation,
      lines: quotationLines,
      assemblies: quotationAssemblies,
      materials: quotationMaterials,
      operations: quotationOperations,
    });
  }, [
    quotationLines,
    quotationAssemblies,
    quotationMaterials,
    quotationOperations,
    setQuotation,
    quotation,
  ]);

  const navigate = useNavigate();
  const { id } = useParams();
  if (!id) throw new Error("id not found");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] w-full">
      <CollapsibleSidebar width={260}>
        <VStack className="border-b border-border p-4" spacing={1}>
          <Heading size="h3" noOfLines={1}>
            QUO000001
          </Heading>
          <QuotationStatus status="Draft" />
        </VStack>
        <VStack className="border-b border-border p-2" spacing={0}>
          <HStack className="w-full justify-between">
            <Input className="flex-1" placeholder="Search" size="sm" />
            <Tooltip>
              <TooltipTrigger>
                <IconButton
                  aria-label="Add Quote Line"
                  variant="secondary"
                  icon={<IoMdAdd />}
                  onClick={() => navigate(path.to.newQuoteLine(id))}
                />
              </TooltipTrigger>
              <TooltipContent>Add Quote Line</TooltipContent>
            </Tooltip>
          </HStack>
        </VStack>
        <VStack className="h-[calc(100vh-183px)] p-2 w-full">
          <BillOfMaterialExplorer />
        </VStack>
      </CollapsibleSidebar>
      <VStack className="p-2">
        <Menubar>
          <MenubarItem asChild>
            <a
              target="_blank"
              href={path.to.file.quote("TODO")}
              rel="noreferrer"
            >
              Preview
            </a>
          </MenubarItem>
          <MenubarItem isDisabled>Release</MenubarItem>
        </Menubar>

        <Outlet />
      </VStack>
      {/* <QuotationHeader />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] h-full w-full gap-4">
        <QuotationSidebar />
        <Outlet />
      </div> */}
    </div>
  );
}

type BillOfMaterialNodeType =
  | "parent"
  | "line"
  | "assemblies"
  | "operations"
  | "materials"
  | "assembly"
  | "operation"
  | "material";

type BillOfMaterialNode = {
  id: string;
  parentId?: string;
  label: string;
  type: BillOfMaterialNodeType;
  meta?: any;
  children?: BillOfMaterialNode[];
};

// const data: BillOfMaterialNode[] = [
//   {
//     id: "0",
//     label: "QUO000001",
//     type: "parent",
//     children: [
//       {
//         id: "cneklo3nm0lgr74492e0",
//         label: "P00001233",
//         type: "line",
//         children: [
//           {
//             id: "cneklo3nm0lgr74492e0",
//             label: "Assemblies",
//             type: "assemblies",
//             children: [
//               {
//                 id: "4",
//                 label: "F5000123",
//                 type: "assembly",
//                 children: [
//                   {
//                     id: "5",
//                     label: "Assemblies",
//                     type: "assemblies",
//                     children: [],
//                   },
//                   {
//                     id: "6",
//                     label: "Operations",
//                     type: "operations",
//                     children: [
//                       {
//                         id: "7",
//                         label: "OP0003",
//                         type: "operation",
//                         children: [
//                           {
//                             id: "8",
//                             label: "Materials",
//                             type: "materials",
//                             children: [
//                               {
//                                 id: "9",
//                                 label: "RAW000001",
//                                 type: "material",
//                               },
//                               {
//                                 id: "10",
//                                 label: "FAS000002",
//                                 type: "material",
//                               },
//                             ],
//                           },
//                         ],
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             id: "cneklo3nm0lgr74492e0",
//             label: "Operations",
//             type: "operations",
//             children: [
//               {
//                 id: "12",
//                 label: "OP0001",
//                 type: "operation",
//                 children: [
//                   {
//                     id: "13",
//                     label: "Materials",
//                     type: "materials",
//                     children: [
//                       {
//                         id: "14",
//                         label: "RAW000003",
//                         type: "material",
//                       },
//                     ],
//                   },
//                 ],
//               },
//               {
//                 id: "13",
//                 label: "OP0002",
//                 type: "operation",
//                 children: [
//                   {
//                     id: "13",
//                     label: "Materials",
//                     type: "materials",
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ];

const BillOfMaterialItem = ({
  type,
  id,
  parentId,
  label,
  meta,
  params,
  pathname,
}: Omit<BillOfMaterialNode, "children"> & {
  params: Params<string>;
  pathname: string;
}) => {
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
        >
          <span>{label}</span>
          <IoMdAdd />
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
      console.log(meta);
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
      return (
        <Button
          leftIcon={<AiOutlinePartition />}
          variant="ghost"
          className="flex-1 justify-start"
        >
          {label}
        </Button>
      );
    case "operation":
      return (
        <Button
          leftIcon={<LuClock />}
          variant="ghost"
          className="flex-1 justify-start"
        >
          {label}
        </Button>
      );
    case "material":
      return (
        <Button
          leftIcon={<HiOutlineCube />}
          variant="ghost"
          className="flex-1 justify-start"
        >
          {label}
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
      throw new Error(`unknown type: ${type}`);
  }
};

const BillOfMaterialExplorer = () => {
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
        <div className="w-full" role="group" key={node.id}>
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
                  expandedNodes[node.id] || !node.children
                    ? undefined
                    : "rotate(-0.25turn)",
              }}
              variant="ghost"
            />
            <BillOfMaterialItem
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
