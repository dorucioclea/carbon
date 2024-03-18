import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@vercel/remix";
import { redirect } from "@vercel/remix";
import { insertNote, noteValidator } from "~/modules/shared";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {});

  const validation = await validator(noteValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { documentId, note } = validation.data;
  const createNote = await insertNote(client, {
    documentId,
    note,
    createdBy: userId,
  });
  if (createNote.error) {
    throw redirect(
      request.headers.get("Referer") ?? request.url,
      await flash(request, error(createNote.error, "Error creating note"))
    );
  }

  return redirect(request.headers.get("Referer") ?? request.url);
}
