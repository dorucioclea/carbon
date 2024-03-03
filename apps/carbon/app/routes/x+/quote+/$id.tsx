import {
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
} from "@carbon/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { CollapsibleSidebar } from "~/components/Layout";
import { useSupabase } from "~/lib/supabase";
import { getLocationsList } from "~/modules/resources";
import {
  QuotationExplorer,
  QuotationStatus,
  getQuote,
  getQuoteAssemblies,
  getQuoteExternalDocuments,
  getQuoteInternalDocuments,
  getQuoteLines,
  getQuoteMaterials,
  getQuoteOperations,
  useQuotation,
  useQuotationLinePriceEffectsUpdate,
} from "~/modules/sales";

import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { error } from "~/utils/result";

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
  const { supabase } = useSupabase();
  const {
    quotation,
    quotationLines,
    quotationAssemblies,
    quotationMaterials,
    quotationOperations,
  } = useLoaderData<typeof loader>();

  const [quote, setQuote] = useQuotation();
  useQuotationLinePriceEffectsUpdate();

  useEffect(() => {
    setQuote({
      client: supabase,
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
    setQuote,
    quotation,
    supabase,
  ]);

  const navigate = useNavigate();
  const { id } = useParams();
  if (!id) throw new Error("id not found");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] w-full">
      <CollapsibleSidebar width={260}>
        <VStack className="border-b border-border p-4" spacing={1}>
          <Heading size="h3" noOfLines={1}>
            {quote.quote?.quoteId}
          </Heading>
          {quote.quote && <QuotationStatus status={quote.quote?.status} />}
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
          <QuotationExplorer />
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
    </div>
  );
}
