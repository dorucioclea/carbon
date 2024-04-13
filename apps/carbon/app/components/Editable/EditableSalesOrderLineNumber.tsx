/* eslint-disable react/display-name */
import type { Database } from "@carbon/database";
import type {
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Combobox } from "~/components";
import type { EditableTableCellComponentProps } from "~/components/Editable";
import type { SalesOrderLine } from "~/modules/sales";

const EditableSalesOrderLineNumber =
  (
    mutation: (
      accessorKey: string,
      newValue: string,
      row: SalesOrderLine
    ) => Promise<PostgrestSingleResponse<unknown>>,
    options: {
      client?: SupabaseClient<Database>;
      parts: { label: string; value: string }[];
      services: { label: string; value: string }[];
      defaultLocationId: string | null;
      userId: string;
    }
  ) =>
  ({
    value,
    row,
    accessorKey,
    onError,
    onUpdate,
  }: EditableTableCellComponentProps<SalesOrderLine>) => {
    const { client, parts, services, userId } = options;
    const selectOptions =
      row.salesOrderLineType === "Part"
        ? parts
        : row.salesOrderLineType === "Service"
        ? services
        : [];

    const onPartChange = async (partId: string) => {
      if (!client) throw new Error("Supabase client not found");
      const [part, shelf, cost] = await Promise.all([
        client
          .from("part")
          .select("name, unitOfMeasureCode")
          .eq("id", partId)
          .single(),
        client
          .from("partInventory")
          .select("defaultShelfId")
          .eq("partId", partId)
          .eq("locationId", options.defaultLocationId!)
          .single(),
        client
          .from("partCost")
          .select("unitCost")
          .eq("partId", partId)
          .single(),
      ]);

      if (part.error) {
        onError();
        return;
      }

      onUpdate({
        partId: partId,
        description: part.data?.name,
        unitOfMeasureCode: part.data?.unitOfMeasureCode ?? null,
        locationId: options.defaultLocationId,
        shelfId: shelf.data?.defaultShelfId ?? null,
        unitPrice: cost.data?.unitCost ?? null,
      });

      try {
        const { error } = await client
          .from("salesOrderLine")
          .update({
            partId: partId,
            assetId: null,
            accountNumber: null,
            description: part.data?.name,
            unitOfMeasureCode: part.data?.unitOfMeasureCode ?? null,
            locationId: options.defaultLocationId,
            shelfId: shelf.data?.defaultShelfId ?? null,
            unitPrice: cost.data?.unitCost,
            updatedBy: userId,
          })
          .eq("id", row.id!);

        if (error) onError();
      } catch (error) {
        console.error(error);
        onError();
      }
    };

    const onServiceChange = async (serviceId: string) => {
      if (!client) throw new Error("Supabase client not found");
      const service = await client
        .from("service")
        .select("name")
        .eq("id", serviceId)
        .single();

      if (service.error) {
        onError();
        return;
      }

      onUpdate({
        serviceId: serviceId,
        description: service.data?.name,
      });

      try {
        const { error } = await client
          .from("salesOrderLine")
          .update({
            serviceId: serviceId,
            updatedBy: userId,
          })
          .eq("id", row.id!);

        if (error) onError();
      } catch (error) {
        console.error(error);
        onError();
      }
    };

    const onChange = (newValue: string | null) => {
      if (!newValue) return;

      if (row.salesOrderLineType === "Part") {
        onPartChange(newValue);
      } else if (row.salesOrderLineType === "Service") {
        onServiceChange(newValue);
      }
    };

    const selectedValue = getValue(row);

    return (
      <Combobox
        autoFocus
        value={selectedValue ?? ""}
        options={selectOptions}
        onChange={onChange}
        size="sm"
        className="border-0 rounded-none w-full"
      />
    );
  };

EditableSalesOrderLineNumber.displayName = "EditableSalesOrderLineNumber";
export default EditableSalesOrderLineNumber;

function getValue(row: SalesOrderLine) {
  switch (row.salesOrderLineType) {
    case "Part":
      return row.partId;
    case "Service":
      return row.serviceId;
    default:
      return null;
  }
}
