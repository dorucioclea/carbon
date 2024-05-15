/* eslint-disable react/display-name */
import type { Database } from "@carbon/database";
import type {
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Combobox } from "~/components";
import type { EditableTableCellComponentProps } from "~/components/Editable";
import type { PurchaseOrderLine } from "~/modules/purchasing";

const EditablePurchaseOrderLineNumber =
  (
    mutation: (
      accessorKey: string,
      newValue: string,
      row: PurchaseOrderLine
    ) => Promise<PostgrestSingleResponse<unknown>>,
    options: {
      client?: SupabaseClient<Database>;
      parts: { label: string; value: string }[];
      services: { label: string; value: string }[];
      accounts: { label: string; value: string }[];
      defaultLocationId: string | null;
      supplerId: string;
      userId: string;
    }
  ) =>
  ({
    value,
    row,
    accessorKey,
    onError,
    onUpdate,
  }: EditableTableCellComponentProps<PurchaseOrderLine>) => {
    const { client, parts, services, accounts, supplerId, userId } = options;
    const selectOptions =
      row.purchaseOrderLineType === "Part"
        ? parts
        : row.purchaseOrderLineType === "Service"
        ? services
        : row.purchaseOrderLineType === "G/L Account"
        ? accounts
        : [];

    const onAccountChange = async (accountNumber: string) => {
      if (!client) throw new Error("Supabase client not found");

      const account = await client
        .from("account")
        .select("name")
        .eq("number", accountNumber)
        .single();

      onUpdate({
        description: account.data?.name ?? "",
        accountNumber: accountNumber,
      });

      try {
        const { error } = await client
          .from("purchaseOrderLine")
          .update({
            accountNumber: accountNumber,
            description: account.data?.name ?? "",
            updatedBy: userId,
          })
          .eq("id", row.id!);

        if (error) onError();
      } catch (error) {
        console.error(error);
        onError();
      }
    };

    const onPartChange = async (partId: string) => {
      if (!client) throw new Error("Supabase client not found");
      const [part, partSupplier, inventory] = await Promise.all([
        client
          .from("part")
          .select(
            `
            name, unitOfMeasureCode, 
            partCost(unitCost), 
            partReplenishment(purchasingUnitOfMeasureCode, conversionFactor, purchasingLeadTime)
          `
          )
          .eq("id", partId)
          .eq("companyId", row.companyId!)
          .single(),
        client
          .from("partSupplier")
          .select("*")
          .eq("partId", partId)
          .eq("companyId", row.companyId!)
          .eq("supplierId", supplerId)
          .maybeSingle(),
        client
          .from("partInventory")
          .select("defaultShelfId")
          .eq("partId", partId)
          .eq("companyId", row.companyId!)
          .eq("locationId", row.locationId!)
          .maybeSingle(),
      ]);

      const partCost = part?.data?.partCost?.[0];
      const partReplenishment = part?.data?.partReplenishment?.[0];

      if (part.error || partSupplier.error || inventory.error) {
        onError();
        return;
      }

      onUpdate({
        partId: partId,
        locationId: options.defaultLocationId,
        description: part.data?.name ?? "",
        purchaseQuantity: partSupplier?.data?.minimumOrderQuantity ?? 1,
        unitPrice: partSupplier?.data?.unitPrice ?? partCost?.unitCost ?? 0,
        purchaseUnitOfMeasureCode:
          partReplenishment?.purchasingUnitOfMeasureCode ??
          part.data?.unitOfMeasureCode ??
          "EA",

        conversionFactor: partReplenishment?.conversionFactor ?? 1,
        shelfId: inventory.data?.defaultShelfId ?? "",
      });

      try {
        const { error } = await client
          .from("purchaseOrderLine")
          .update({
            partId: partId,
            locationId: options.defaultLocationId,
            description: part.data?.name ?? "",
            purchaseQuantity: partSupplier?.data?.minimumOrderQuantity ?? 1,
            unitPrice: partSupplier?.data?.unitPrice ?? partCost?.unitCost ?? 0,
            purchaseUnitOfMeasureCode:
              partReplenishment?.purchasingUnitOfMeasureCode ??
              part.data?.unitOfMeasureCode ??
              "EA",

            conversionFactor: partReplenishment?.conversionFactor ?? 1,
            shelfId: inventory.data?.defaultShelfId ?? null,
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
        purchaseUnitOfMeasureCode: "EA",
      });

      try {
        const { error } = await client
          .from("purchaseOrderLine")
          .update({
            serviceId: serviceId,
            description: service.data?.name,
            purchaseUnitOfMeasureCode: "EA",
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

      if (row.purchaseOrderLineType === "Part") {
        onPartChange(newValue);
      } else if (row.purchaseOrderLineType === "G/L Account") {
        onAccountChange(newValue);
      } else if (row.purchaseOrderLineType === "Service") {
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

EditablePurchaseOrderLineNumber.displayName = "EditablePurchaseOrderLineNumber";
export default EditablePurchaseOrderLineNumber;

function getValue(row: PurchaseOrderLine) {
  switch (row.purchaseOrderLineType) {
    case "Part":
      return row.partId;
    case "Service":
      return row.serviceId;
    case "G/L Account":
      return row.accountNumber;
    case "Fixed Asset":
      return row.assetId;
    default:
      return null;
  }
}
