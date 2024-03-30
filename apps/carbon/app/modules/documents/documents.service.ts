import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import type { GenericQueryFilters } from "~/utils/query";
import { setGenericQueryFilters } from "~/utils/query";
import { sanitize } from "~/utils/supabase";
import type {
  documentLabelsValidator,
  documentSourceTypes,
  documentTypes,
  documentValidator,
} from "./documents.models";

export async function deleteDocument(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  const deleteDocumentFavorites = await client
    .from("documentFavorite")
    .delete()
    .eq("documentId", id)
    .eq("userId", userId);

  if (deleteDocumentFavorites.error) {
    return deleteDocumentFavorites;
  }

  return client
    .from("document")
    .update({
      active: false,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function deleteDocumentFavorite(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  return client
    .from("documentFavorite")
    .delete()
    .eq("documentId", id)
    .eq("userId", userId);
}

export async function deleteDocumentLabel(
  client: SupabaseClient<Database>,
  id: string,
  label: string
) {
  return client
    .from("documentLabel")
    .delete()
    .eq("documentId", id)
    .eq("label", label);
}

export async function getDocument(
  client: SupabaseClient<Database>,
  documentId: string
) {
  return client.from("documents").select("*").eq("id", documentId).single();
}

export async function getDocuments(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    search: string | null;
    favorite?: boolean;
    recent?: boolean;
    createdBy?: string;
    active: boolean;
  }
) {
  let query = client
    .from("documents")
    .select("*", {
      count: "exact",
    })
    .eq("active", args.active);

  if (args?.search) {
    query = query.or(
      `name.ilike.%${args.search}%,description.ilike.%${args.search}%`
    );
  }

  if (args?.favorite) {
    query = query.eq("favorite", true);
  }

  if (args.recent) {
    query = query.order("lastActivityAt", { ascending: false });
  }

  query = setGenericQueryFilters(query, args, [
    { column: "favorite", ascending: false },
  ]);

  return query;
}

export async function getDocumentExtensions(client: SupabaseClient<Database>) {
  return client.from("documentExtensions").select("extension");
}

export async function getDocumentLabels(
  client: SupabaseClient<Database>,
  userId: string
) {
  return client.from("documentLabels").select("*").eq("userId", userId);
}

export function getDocumentType(
  fileName: string
): (typeof documentTypes)[number] {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "Archive";
  }

  if (["pdf"].includes(extension)) {
    return "PDF";
  }

  if (["doc", "docx", "txt", "rtf"].includes(extension)) {
    return "Document";
  }

  if (["ppt", "pptx"].includes(extension)) {
    return "Presentation";
  }

  if (["csv", "xls", "xlsx"].includes(extension)) {
    return "Spreadsheet";
  }

  if (["txt"].includes(extension)) {
    return "Text";
  }

  if (["png", "jpg", "jpeg", "gif", "avif"].includes(extension)) {
    return "Image";
  }

  if (["mp4", "mov", "avi", "wmv", "flv", "mkv"].includes(extension)) {
    return "Video";
  }

  if (["mp3", "wav", "wma", "aac", "ogg", "flac"].includes(extension)) {
    return "Audio";
  }

  return "Other";
}

export async function insertDocumentFavorite(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  return client.from("documentFavorite").insert({ documentId: id, userId });
}

export async function insertDocumentLabel(
  client: SupabaseClient<Database>,
  id: string,
  label: string,
  userId: string
) {
  return client.from("documentLabel").insert({ documentId: id, label, userId });
}

export async function restoreDocument(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  return client
    .from("document")
    .update({
      active: true,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);
}

type SourceDocumentData = {
  sourceDocument?: (typeof documentSourceTypes)[number];
  sourceDocumentId?: string;
};

export async function upsertDocument(
  client: SupabaseClient<Database>,
  document:
    | (Omit<z.infer<typeof documentValidator>, "id"> & {
        path: string;
        size: number;
        createdBy: string;
      } & SourceDocumentData)
    | (Omit<z.infer<typeof documentValidator>, "id"> & {
        id: string;
        updatedBy: string;
      })
) {
  const type = getDocumentType(document.name ?? "");
  if ("createdBy" in document) {
    return client
      .from("document")
      .insert({ ...document, type })
      .select("*")
      .single();
  }

  const { extension, ...data } = document;
  return client
    .from("document")
    .update(
      sanitize({
        ...data,
        type,
        updatedAt: new Date().toISOString(),
      })
    )
    .eq("id", document.id);
}

export async function updateDocumentFavorite(
  client: SupabaseClient<Database>,
  args: {
    id: string;
    favorite: boolean;
    userId: string;
  }
) {
  const { id, favorite, userId } = args;
  if (!favorite) {
    return client
      .from("documentFavorite")
      .delete()
      .eq("documentId", id)
      .eq("userId", userId);
  } else {
    return client
      .from("documentFavorite")
      .insert({ documentId: id, userId: userId });
  }
}

export async function updateDocumentLabels(
  client: SupabaseClient<Database>,
  document: z.infer<typeof documentLabelsValidator> & {
    userId: string;
  }
) {
  if (!document.labels) {
    throw new Error("No labels provided");
  }

  return client
    .from("documentLabel")
    .delete()
    .eq("documentId", document.documentId)
    .eq("userId", document.userId)
    .then(() => {
      return client.from("documentLabel").insert(
        // @ts-ignore
        document.labels.map((label) => ({
          documentId: document.documentId,
          label,
          userId: document.userId,
        }))
      );
    });
}
