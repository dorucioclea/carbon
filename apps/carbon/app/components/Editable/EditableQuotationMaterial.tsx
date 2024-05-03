/* eslint-disable react/display-name */
import type { Database } from "@carbon/database";
import type {
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Combobox } from "~/components";
import type { EditableTableCellComponentProps } from "~/components/Editable";
import type { QuotationMaterial } from "~/modules/sales";

const EditableQuotationMaterial =
  (
    mutation: (
      accessorKey: string,
      newValue: string,
      row: QuotationMaterial
    ) => Promise<PostgrestSingleResponse<unknown>>,
    options: {
      client?: SupabaseClient<Database>;
      parts: { label: string; value: string }[];
      userId: string;
    }
  ) =>
  ({
    value,
    row,
    accessorKey,
    onError,
    onUpdate,
  }: EditableTableCellComponentProps<QuotationMaterial>) => {
    const { client, parts, userId } = options;

    const onPartChange = async (partId: string) => {
      if (!client) throw new Error("Supabase client not found");
      const [part, cost] = await Promise.all([
        client
          .from("part")
          .select("name, unitOfMeasureCode")
          .eq("id", partId)
          .eq("companyId", row.companyId)
          .single(),
        client
          .from("partCost")
          .select("unitCost")
          .eq("partId", partId)
          .eq("companyId", row.companyId)
          .single(),
      ]);

      if (part.error) {
        onError();
        return;
      }

      onUpdate({
        partId: partId,
        description: part.data?.name,
        unitCost: cost.data?.unitCost,
      });

      try {
        const { error } = await client
          .from("quoteMaterial")
          .update({
            partId: partId,
            description: part.data?.name,
            unitCost: cost.data?.unitCost,
            updatedBy: userId,
          })
          .eq("id", row.id!);

        if (error) onError();
      } catch (error) {
        console.error(error);
        onError();
      }
    };

    return (
      <Combobox
        autoFocus
        value={row?.partId ?? ""}
        options={parts}
        onChange={onPartChange}
        size="sm"
        className="border-0 rounded-none w-full"
      />
    );
  };

EditableQuotationMaterial.displayName = "EditableQuotationMaterial";
export default EditableQuotationMaterial;
