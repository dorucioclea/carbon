import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { FileObject } from "@supabase/storage-js";
import type { Document } from "~/modules/documents";
import {
  DocumentsTable,
  getDocumentExtensions,
  getDocumentLabels,
  getDocuments,
} from "~/modules/documents";
import { getAllExternalPOs, getAllInternalPOs } from "~/modules/purchasing";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, userId } = await requirePermissions(request, {
    view: "documents",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");
  const filter = searchParams.get("q");

  const createdBy = filter === "my" ? userId : undefined;
  const favorite = filter === "starred" ? true : undefined;
  const recent = filter === "recent" ? true : undefined;
  const active = filter === "trash" ? false : true;

  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [documents, internalPOs, externalPOs, labels, extensions] =
    await Promise.all([
      getDocuments(client, {
        search,
        favorite,
        recent,
        createdBy,
        active,
        limit,
        offset,
        sorts,
        filters,
      }),
      getAllInternalPOs(client),
      getAllExternalPOs(client),
      getDocumentLabels(client, userId),
      getDocumentExtensions(client),
    ]);

  if (documents.error) {
    redirect(
      path.to.authenticatedRoot,
      await flash(request, error(documents.error, "Failed to fetch documents"))
    );
  }

  if (internalPOs.error) {
    redirect(
      path.to.authenticatedRoot,
      await flash(
        request,
        error(documents.error, "Failed to fetch internal POs")
      )
    );
  }

  if (externalPOs.error) {
    redirect(
      path.to.authenticatedRoot,
      await flash(
        request,
        error(documents.error, "Failed to fetch external POs")
      )
    );
  }

  let allDocuments: (
    | {
        active: boolean | null;
        createdAt: string | null;
        createdBy: string | null;
        createdByAvatar: string | null;
        createdByFullName: string | null;
        description: string | null;
        extension: string | null;
        favorite: boolean | null;
        id: string | null;
        labels: string[] | null;
        lastActivityAt: string | null;
        name: string | null;
        path: string | null;
        readGroups: string[] | null;
        size: number | null;
        type:
          | "Archive"
          | "Document"
          | "Presentation"
          | "PDF"
          | "Spreadsheet"
          | "Text"
          | "Image"
          | "Video"
          | "Audio"
          | "Other"
          | null;
        updatedAt: string | null;
        updatedBy: string | null;
        updatedByAvatar: string | null;
        updatedByFullName: string | null;
        writeGroups: string[] | null;
      }
    | FileObject
  )[] = [];

  if (internalPOs.data && externalPOs.data && documents.data) {
    allDocuments = [
      ...internalPOs.data,
      ...externalPOs.data,
      ...documents.data,
    ];
  }

  return json({
    count: documents.count ?? 0,
    documents: (allDocuments ?? []) as Document[],
    labels: labels.data ?? [],
    extensions: extensions.data?.map(({ extension }) => extension) ?? [],
  });
}

export default function DocumentsAllRoute() {
  const { count, documents, labels, extensions } =
    useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <DocumentsTable
        data={documents}
        count={count}
        labels={labels}
        extensions={extensions}
      />
      <Outlet />
    </VStack>
  );
}
