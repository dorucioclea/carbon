import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
} from "@carbon/react";

import { ValidatedForm } from "@carbon/remix-validated-form";
import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import {
  Account,
  ComboboxControlled,
  ConversionFactor,
  CustomFormFields,
  Hidden,
  NumberControlled,
  Part,
  Select,
  Service,
  Submit,
  UnitOfMeasure,
} from "~/components/Form";
import { usePermissions, useRouteData, useUser } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import type {
  PurchaseInvoice,
  PurchaseInvoiceLineType,
} from "~/modules/invoicing";
import {
  purchaseInvoiceLineType,
  purchaseInvoiceLineValidator,
} from "~/modules/invoicing";
import type { getShelvesList } from "~/modules/parts";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

type PurchaseInvoiceLineFormProps = {
  initialValues: z.infer<typeof purchaseInvoiceLineValidator>;
};

const PurchaseInvoiceLineForm = ({
  initialValues,
}: PurchaseInvoiceLineFormProps) => {
  const permissions = usePermissions();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const { company, defaults } = useUser();
  const { invoiceId } = useParams();

  if (!invoiceId) throw new Error("invoiceId not found");

  const routeData = useRouteData<{
    locations: ListItem[];
    purchaseInvoice: PurchaseInvoice;
  }>(path.to.purchaseInvoice(invoiceId));

  const locations = routeData?.locations ?? [];
  const locationOptions = locations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  const isEditable = ["Draft"].includes(
    routeData?.purchaseInvoice?.status ?? ""
  );

  const [type, setType] = useState(initialValues.invoiceLineType);
  const [locationId, setLocationId] = useState(defaults.locationId ?? "");
  const [partData, setPartData] = useState<{
    partId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    purchaseUom: string;
    inventoryUom: string;
    conversionFactor: number;
    shelfId: string;
    minimumOrderQuantity?: number;
  }>({
    partId: initialValues.partId ?? "",
    description: initialValues.description ?? "",
    quantity: initialValues.quantity ?? 1,
    unitPrice: initialValues.unitPrice ?? 0,
    purchaseUom: initialValues.purchaseUnitOfMeasureCode ?? "",
    inventoryUom: initialValues.inventoryUnitOfMeasureCode ?? "",
    conversionFactor: initialValues.conversionFactor ?? 1,
    shelfId: initialValues.shelfId ?? "",
    minimumOrderQuantity: undefined,
  });

  const shelfFetcher = useFetcher<Awaited<ReturnType<typeof getShelvesList>>>();

  useEffect(() => {
    if (locationId) {
      shelfFetcher.load(path.to.api.shelves(locationId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  const shelfOptions = useMemo(
    () =>
      shelfFetcher.data?.data?.map((shelf) => ({
        label: shelf.id,
        value: shelf.id,
      })) ?? [],
    [shelfFetcher.data]
  );

  const isEditing = initialValues.id !== undefined;
  const isDisabled = !isEditable
    ? true
    : isEditing
    ? !permissions.can("update", "purchasing")
    : !permissions.can("create", "purchasing");

  const purchaseInvoiceLineTypeOptions = purchaseInvoiceLineType.map(
    (type) => ({
      label: type,
      value: type,
    })
  );

  const onClose = () => navigate(-1);

  const onTypeChange = (type: PurchaseInvoiceLineType) => {
    setType(type);
    setPartData({
      partId: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      inventoryUom: "",
      purchaseUom: "",
      conversionFactor: 1,
      shelfId: "",
      minimumOrderQuantity: undefined,
    });
  };

  const onPartChange = async (partId: string) => {
    if (!supabase || !company.id) return;
    const [part, partSupplier, inventory] = await Promise.all([
      supabase
        .from("part")
        .select(
          `
          name, unitOfMeasureCode, 
          partCost(unitCost), 
          partReplenishment(purchasingUnitOfMeasureCode, conversionFactor, purchasingLeadTime)
        `
        )
        .eq("id", partId)
        .eq("companyId", company.id)
        .single(),
      supabase
        .from("partSupplier")
        .select("*")
        .eq("partId", partId)
        .eq("companyId", company.id)
        .eq("supplierId", routeData?.purchaseInvoice?.supplierId!)
        .maybeSingle(),
      supabase
        .from("partInventory")
        .select("defaultShelfId")
        .eq("partId", partId)
        .eq("companyId", company.id)
        .eq("locationId", locationId)
        .single(),
    ]);

    const partCost = part?.data?.partCost?.[0];
    const partReplenishment = part?.data?.partReplenishment?.[0];

    setPartData({
      partId,
      description: part.data?.name ?? "",
      quantity: partSupplier?.data?.minimumOrderQuantity ?? 1,
      unitPrice: partSupplier?.data?.unitPrice ?? partCost?.unitCost ?? 0,
      purchaseUom:
        partReplenishment?.purchasingUnitOfMeasureCode ??
        part.data?.unitOfMeasureCode ??
        "EA",
      inventoryUom: part.data?.unitOfMeasureCode ?? "EA",
      conversionFactor: partReplenishment?.conversionFactor ?? 1,
      shelfId: inventory.data?.defaultShelfId ?? "",
      minimumOrderQuantity: partSupplier?.data?.minimumOrderQuantity ?? 0,
    });
  };

  const onServiceChange = async (serviceId: string) => {
    if (!supabase || !company.id) return;
    const service = await supabase
      .from("service")
      .select("name")
      .eq("id", serviceId)
      .eq("companyId", company.id)
      .single();

    setPartData({
      partId: "",
      description: service.data?.name ?? "",
      quantity: 1,
      unitPrice: 0,
      purchaseUom: "EA",
      inventoryUom: "EA",
      conversionFactor: 1,
      shelfId: "",
      minimumOrderQuantity: undefined,
    });
  };

  const onLocationChange = async (newLocation: { value: string } | null) => {
    if (!supabase) throw new Error("supabase is not defined");
    if (typeof newLocation?.value !== "string")
      throw new Error("locationId is not a string");

    setLocationId(newLocation.value);
    if (!partData.partId) return;
    const shelf = await supabase
      .from("partInventory")
      .select("defaultShelfId")
      .eq("partId", partData.partId)
      .eq("companyId", company.id)
      .eq("locationId", newLocation.value)
      .maybeSingle();

    setPartData((d) => ({
      ...d,
      shelfId: shelf?.data?.defaultShelfId ?? "",
    }));
  };

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <ValidatedForm
          defaultValues={initialValues}
          validator={purchaseInvoiceLineValidator}
          method="post"
          action={
            isEditing
              ? path.to.purchaseInvoiceLine(invoiceId, initialValues.id!)
              : path.to.newPurchaseInvoiceLine(invoiceId)
          }
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit" : "New"} Purchase Invoice Line
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Hidden name="id" />
            <Hidden name="invoiceId" />
            <Hidden name="description" value={partData.description} />
            <Hidden
              name="inventoryUnitOfMeasureCode"
              value={partData?.inventoryUom}
            />
            <VStack spacing={4}>
              <Select
                name="invoiceLineType"
                label="Type"
                options={purchaseInvoiceLineTypeOptions}
                onChange={(value) => {
                  onTypeChange(value?.value as PurchaseInvoiceLineType);
                }}
              />
              {type === "Part" && (
                <Part
                  name="partId"
                  label="Part"
                  partReplenishmentSystem="Buy"
                  onChange={(value) => {
                    onPartChange(value?.value as string);
                  }}
                />
              )}

              {type === "Service" && (
                <Service
                  name="serviceId"
                  label="Service"
                  serviceType="External"
                  onChange={(value) => {
                    onServiceChange(value?.value as string);
                  }}
                />
              )}

              {type === "G/L Account" && (
                <Account
                  name="accountNumber"
                  label="Account"
                  classes={["Expense", "Asset"]}
                  onChange={(value) => {
                    setPartData({
                      partId: "",
                      description: value?.label ?? "",
                      quantity: 1,
                      unitPrice: 0,
                      purchaseUom: "EA",
                      inventoryUom: "EA",
                      conversionFactor: 1,
                      shelfId: "",
                      minimumOrderQuantity: 0,
                    });
                  }}
                />
              )}
              {type === "Fixed Asset" && (
                // TODO: implement Fixed Asset
                <Select name="assetId" label="Asset" options={[]} />
              )}
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={partData.description}
                  onChange={(e) =>
                    setPartData((d) => ({ ...d, description: e.target.value }))
                  }
                />
              </FormControl>
              {type !== "Comment" && (
                <>
                  <NumberControlled
                    minValue={partData.minimumOrderQuantity}
                    name="quantity"
                    label="Quantity"
                    value={partData.quantity}
                    onChange={(value) => {
                      setPartData((d) => ({
                        ...d,
                        quantity: value,
                      }));
                    }}
                  />
                  <NumberControlled
                    name="unitPrice"
                    label="Unit Price"
                    value={partData.unitPrice}
                    onChange={(value) =>
                      setPartData((d) => ({
                        ...d,
                        unitPrice: value,
                      }))
                    }
                  />

                  {type === "Part" && (
                    <>
                      <UnitOfMeasure
                        name="purchaseUnitOfMeasureCode"
                        label="Unit of Measure"
                        value={partData.purchaseUom}
                        onChange={(newValue) => {
                          if (newValue) {
                            setPartData((d) => ({
                              ...d,
                              purchaseUom: newValue?.value as string,
                            }));
                          }
                        }}
                      />
                      <ConversionFactor
                        name="conversionFactor"
                        purchasingCode={partData.purchaseUom}
                        inventoryCode={partData.inventoryUom}
                        value={partData.conversionFactor}
                        onChange={(value) => {
                          setPartData((d) => ({
                            ...d,
                            conversionFactor: value,
                          }));
                        }}
                      />
                    </>
                  )}

                  {["Part", "Service"].includes(type) && (
                    <ComboboxControlled
                      name="locationId"
                      label="Location"
                      options={locationOptions}
                      value={locationId}
                      onChange={onLocationChange}
                    />
                  )}
                  {type === "Part" && (
                    <ComboboxControlled
                      name="shelfId"
                      label="Shelf"
                      options={shelfOptions}
                      value={partData.shelfId}
                      onChange={(newValue) => {
                        if (newValue) {
                          setPartData((d) => ({
                            ...d,
                            shelfId: newValue.value,
                          }));
                        }
                      }}
                    />
                  )}
                </>
              )}
              <CustomFormFields table="purchaseInvoiceLine" />
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack>
              <Submit isDisabled={isDisabled}>Save</Submit>
              <Button size="md" variant="solid" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </DrawerFooter>
        </ValidatedForm>
      </DrawerContent>
    </Drawer>
  );
};

export default PurchaseInvoiceLineForm;
