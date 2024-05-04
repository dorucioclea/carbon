CREATE TYPE "documentType" AS ENUM (
  'Archive',
  'Document',
  'Presentation',
  'PDF',
  'Spreadsheet',
  'Text',
  'Image',
  'Video',
  'Audio',
  'Other'
);

CREATE TABLE "document" (
  "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
  "path" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT DEFAULT '',
  "size" INTEGER NOT NULL,
  "extension" TEXT GENERATED ALWAYS AS (split_part("name", '.', -1)) STORED,
  "type" "documentType" NOT NULL,
  "readGroups" TEXT[],
  "writeGroups" TEXT[],
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "companyId" INTEGER NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE,

  CONSTRAINT "document_pkey" PRIMARY KEY ("id"),
  
  CONSTRAINT "document_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "document_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "document_visibility_idx" ON "document" USING GIN ("readGroups", "writeGroups");

ALTER TABLE "document" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with documents can view documents where they are in the readGroups" ON "document" 
  FOR SELECT USING (
    has_company_permission('documents_view', "companyId") AND
    (groups_for_user(auth.uid()::text) && "readGroups") = true
  );

CREATE POLICY "Users with documents_create can create documents where they are in the writeGroups" ON "document" 
  FOR INSERT WITH CHECK (
    has_company_permission('documents_create', "companyId") AND
    (groups_for_user(auth.uid()::text) && "writeGroups") = true
  );

CREATE POLICY "Users with documents_update can update documents where they are in the writeGroups" ON "document"
  FOR UPDATE USING (
    has_company_permission('documents_update', "companyId") AND
    (groups_for_user(auth.uid()::text) && "writeGroups") = true
  );

CREATE POLICY "Users with documents_delete can delete documents where they are in the writeGroups" ON "document"
  FOR DELETE USING (
    has_company_permission('documents_delete', "companyId") AND
    (groups_for_user(auth.uid()::text) && "writeGroups") = true
  );

CREATE POLICY "Private buckets view requires ownership or document.readGroups" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR "name" IN (
            SELECT "path" FROM public.document WHERE (groups_for_user(auth.uid()::text) && "readGroups") = true
        )
    )
);

CREATE POLICY "Private buckets insert requires ownership or document.writeGroups" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND has_any_company_permission('documents_create')
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR "name" IN (
            SELECT "path" FROM public.document WHERE (groups_for_user(auth.uid()::text) && "writeGroups") = true
        )
    )
);

CREATE POLICY "Private buckets update requires ownership or document.writeGroups" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND has_any_company_permission('documents_update')
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR "name" IN (
            SELECT "path" FROM public.document WHERE (groups_for_user(auth.uid()::text) && "writeGroups") = true
        )
    )
);

CREATE POLICY "Private buckets delete requires ownership or document.writeGroups" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'private'
    AND (auth.role() = 'authenticated')
    AND has_any_company_permission('documents_delete')
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR "name" IN (
            SELECT "path" FROM public.document WHERE (groups_for_user(auth.uid()::text) && "writeGroups") = true
        )
    )
);

CREATE TYPE "documentTransactionType" AS ENUM (
  'Download',
  'Edit',
  'Favorite',
  'Label',
  'Unfavorite',
  'Upload'
);

CREATE TABLE "documentTransaction" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "documentId" TEXT NOT NULL,
  "type" "documentTransactionType" NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT "documentTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "documentTransaction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE,
  CONSTRAINT "documentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "documentTransaction_documentId_idx" ON "documentTransaction" ("documentId");
CREATE INDEX "documentTransaction_userId_idx" ON "documentTransaction" ("userId");

ALTER TABLE "documentTransaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with documents_view can see document transactions" ON "documentTransaction" 
  FOR SELECT USING (
    has_company_permission('documents_view', get_company_id_from_foreign_key("documentId", 'document'))
  );

CREATE POLICY "Users can insert document transactions" ON "documentTransaction" 
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId"
  );

CREATE TABLE "documentFavorite" (
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  CONSTRAINT "documentFavorites_pkey" PRIMARY KEY ("documentId", "userId"),
  CONSTRAINT "documentFavorites_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE,
  CONSTRAINT "documentFavorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "documentFavorites_userId_idx" ON "documentFavorite" ("userId");
CREATE INDEX "documentFavorites_documentId_idx" ON "documentFavorite" ("documentId");

ALTER TABLE "documentFavorite" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document favorites" ON "documentFavorite" 
  FOR SELECT USING (
    auth.uid()::text = "userId"
  );

CREATE POLICY "Users can create their own document favorites" ON "documentFavorite" 
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId"
  );

CREATE POLICY "Users can delete their own document favorites" ON "documentFavorite"
  FOR DELETE USING (
    auth.uid()::text = "userId"
  ); 

CREATE TABLE "documentLabel" (
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "label" TEXT NOT NULL,

  CONSTRAINT "documentLabels_pkey" PRIMARY KEY ("documentId", "userId", "label"),
  CONSTRAINT "documentLabels_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE,
  CONSTRAINT "documentLabels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "documentLabels_userId_idx" ON "documentLabel" ("userId");
CREATE INDEX "documentLabels_documentId_idx" ON "documentLabel" ("documentId");
CREATE INDEX "documentLabels_label_idx" ON "documentLabel" ("label");

ALTER TABLE "documentLabel" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own labels" ON "documentLabel" 
  FOR SELECT USING (
    auth.uid()::text = "userId"
  );

CREATE POLICY "Users can create their own labels" ON "documentLabel" 
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId"
  );

CREATE POLICY "Users can delete their own labels" ON "documentLabel"
  FOR DELETE USING (
    auth.uid()::text = "userId"
  ); 

CREATE FUNCTION public.upload_document_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."documentTransaction" ("documentId", "type", "userId")
  VALUES (new.id, 'Upload', new."createdBy");

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER upload_document_transaction
  AFTER INSERT on public."document"
  FOR EACH ROW EXECUTE PROCEDURE public.upload_document_transaction();

CREATE FUNCTION public.edit_document_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."documentTransaction" ("documentId", "type", "userId")
  VALUES (new.id, 'Edit', new."createdBy");

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER edit_document_transaction
  AFTER UPDATE on public."document"
  FOR EACH ROW EXECUTE PROCEDURE public.edit_document_transaction();

CREATE OR REPLACE VIEW "documentLabels" AS
  SELECT DISTINCT
    "label",
    "userId"
  FROM "documentLabel";

CREATE OR REPLACE VIEW "documents" AS 
  SELECT
    d.*,
    u."avatarUrl" AS "createdByAvatar",
    u."fullName" AS "createdByFullName",
    u2."avatarUrl" AS "updatedByAvatar",
    u2."fullName" AS "updatedByFullName",
    ARRAY(SELECT dl.label FROM "documentLabel" dl WHERE dl."documentId" = d.id AND dl."userId" = auth.uid()::text) AS labels,
    EXISTS(SELECT 1 FROM "documentFavorite" df WHERE df."documentId" = d.id AND df."userId" = auth.uid()::text) AS favorite,
    (SELECT MAX("createdAt") FROM "documentTransaction" dt WHERE dt."documentId" = d.id) AS "lastActivityAt"
  FROM "document" d
  LEFT JOIN "user" u ON u.id = d."createdBy"
  LEFT JOIN "user" u2 ON u2.id = d."updatedBy";

CREATE OR REPLACE VIEW "documentExtensions" WITH(SECURITY_INVOKER=true) AS
  SELECT DISTINCT
    extension
  FROM "document";