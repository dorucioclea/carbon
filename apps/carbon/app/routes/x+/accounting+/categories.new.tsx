import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import type { AccountClass, AccountIncomeBalance } from "~/modules/accounting";
import {
  AccountCategoryForm,
  accountCategoryValidator,
  upsertAccountCategory,
} from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error } from "~/utils/result";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "accounting",
  });

  const formData = await request.formData();

  const validation = await validator(accountCategoryValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const createAccountCategory = await upsertAccountCategory(client, {
    ...data,
    customFields: setCustomFields(formData),
    createdBy: userId,
  });
  if (createAccountCategory.error) {
    throw redirect(
      `${path.to.accountingCategories}?${getParams(request)}`,
      await flash(
        request,
        error(
          createAccountCategory.error,
          "Failed to create G/L account category"
        )
      )
    );
  }

  throw redirect(`${path.to.accountingCategories}?${getParams(request)}`);
}

export default function NewAccountCategoryRoute() {
  const navigate = useNavigate();
  const onClose = () => navigate(path.to.accountingCategories);

  const initialValues = {
    category: "",
    incomeBalance: "" as AccountIncomeBalance,
    class: "" as AccountClass,
  };

  return (
    <AccountCategoryForm onClose={onClose} initialValues={initialValues} />
  );
}
