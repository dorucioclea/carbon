import { z } from "zod";

export const documentTypes = [
  "Archive",
  "Document",
  "Presentation",
  "PDF",
  "Spreadsheet",
  "Text",
  "Image",
  "Video",
  "Audio",
  "Other",
] as const;

export const documentSourceTypes = ["Purchase Order", "Quote"] as const;

export const documentValidator = z.object({
  id: z.string().min(1, { message: "Document ID is required" }),
  name: z.string().min(3).max(50),
  extension: z.string().optional(),
  description: z.string().optional(),
  labels: z.array(z.string().min(1).max(50)).optional(),
  readGroups: z
    .array(z.string().min(36, { message: "Invalid selection" }))
    .min(1, { message: "Read permissions are required" }),
  writeGroups: z
    .array(z.string().min(36, { message: "Invalid selection" }))
    .min(1, { message: "Write permissions are required" }),
});

export const documentLabelsValidator = z.object({
  documentId: z.string().min(20),
  labels: z.array(z.string().min(1).max(50)).optional(),
});
