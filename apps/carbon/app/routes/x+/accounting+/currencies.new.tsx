import { validationError, validator } from "@carbon/remix-validated-form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  CurrencyForm,
  currencyValidator,
  upsertCurrency,
} from "~/modules/accounting";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { setCustomFields } from "~/utils/form";
import { assertIsPost } from "~/utils/http";
import { getParams, path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    create: "accounting",
  });

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "accounting",
  });

  const formData = await request.formData();
  const validation = await validator(currencyValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...data } = validation.data;

  const insertCurrency = await upsertCurrency(client, {
    ...data,
    customFields: setCustomFields(formData),
    createdBy: userId,
  });
  if (insertCurrency.error) {
    return json(
      {},
      await flash(
        request,
        error(insertCurrency.error, "Failed to insert currency")
      )
    );
  }

  const currencyId = insertCurrency.data?.id;
  if (!currencyId) {
    return json(
      {},
      await flash(request, error(insertCurrency, "Failed to insert currency"))
    );
  }

  throw redirect(
    `${path.to.currencies}?${getParams(request)}`,
    await flash(request, success("Currency created"))
  );
}

export default function NewCurrencyRoute() {
  const initialValues = {
    name: "",
    code: "",
    symbol: "",
    exchangeRate: 1,
    isBaseCurrency: false,
    decimalPlaces: 2,
  };

  return <CurrencyForm initialValues={initialValues} />;
}
