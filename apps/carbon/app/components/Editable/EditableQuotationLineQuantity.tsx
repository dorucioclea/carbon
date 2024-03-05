/* eslint-disable react/display-name */
import type { Database } from "@carbon/database";
import { Input, NumberField } from "@carbon/react";
import type {
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import type { FocusEvent, KeyboardEvent } from "react";

import type { EditableTableCellComponentProps } from "~/components/Editable";
import type { QuotationLineQuantity } from "~/modules/sales";
import { getLinePriceUpdate } from "~/modules/sales";
import { type LinePriceEffects } from "~/modules/sales/ui/Quotation/useQuotation";

const EditableQuotationLineQuantity =
  (
    mutation: (
      accessorKey: string,
      newValue: string,
      row: QuotationLineQuantity
    ) => Promise<PostgrestSingleResponse<unknown>>,
    options: {
      client?: SupabaseClient<Database>;
      effects: LinePriceEffects;
      isMade: boolean;
    }
  ) =>
  ({
    value,
    row,
    accessorKey,
    onError,
    onUpdate,
  }: EditableTableCellComponentProps<QuotationLineQuantity>) => {
    const updateNumber = async (newValue: string) => {
      const quantity = Number(newValue);
      const { client, effects, isMade } = options;

      const update = isMade
        ? getLinePriceUpdate(quantity, effects)
        : {
            materialCost:
              row.quantity === 0
                ? row.materialCost
                : (row.materialCost / row.quantity) * quantity,
          };

      // this is the optimistic update on the FE
      onUpdate({ quantity, ...update });

      const mutation = await client
        ?.from("quoteLineQuantity")
        .update({ quantity, ...update })
        .eq("id", row.id!);

      if (!mutation || mutation.error) {
        onError();
        onUpdate({ ...row });
      }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      // only run the update if they click enter
      if (event.key === "Enter" || event.key === "Tab") {
        if (event.currentTarget.value !== value) {
          updateNumber(event.currentTarget.value);
        }
      }
    };

    // run update if focus is lost
    const onBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (event.currentTarget.value !== value) {
        updateNumber(event.currentTarget.value);
      }
    };

    return (
      <NumberField defaultValue={value as number}>
        <Input
          size="sm"
          className="w-full rounded-none ring-offset-0"
          autoFocus
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      </NumberField>
    );
  };

EditableQuotationLineQuantity.displayName = "EditableQuotationLineQuantity";
export default EditableQuotationLineQuantity;
