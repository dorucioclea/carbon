import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  HStack,
  VStack,
} from "@carbon/react";

import { ValidatedForm } from "@carbon/remix-validated-form";
import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import type { z } from "zod";
import {
  ComboboxControlled,
  CustomFormFields,
  Hidden,
  InputControlled,
  Number,
  NumberControlled,
  Part,
  Select,
  Service,
  Submit,
} from "~/components/Form";
import { usePermissions, useRouteData, useUser } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import type { getShelvesList } from "~/modules/parts";
import type { SalesOrder, SalesOrderLineType } from "~/modules/sales";
import { salesOrderLineType, salesOrderLineValidator } from "~/modules/sales";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

type SalesOrderLineFormProps = {
  initialValues: z.infer<typeof salesOrderLineValidator>;
};

const SalesOrderLineForm = ({ initialValues }: SalesOrderLineFormProps) => {
  const permissions = usePermissions();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const { defaults } = useUser();
  const { orderId } = useParams();

  if (!orderId) throw new Error("orderId not found");

  const routeData = useRouteData<{
    locations: ListItem[];
    salesOrder: SalesOrder;
  }>(path.to.salesOrder(orderId));

  const locations = routeData?.locations ?? [];
  const locationOptions = locations.map((location) => ({
    label: location.name,
    value: location.id,
  }));

  const isEditable = ["Draft", "To Review"].includes(
    routeData?.salesOrder?.status ?? ""
  );

  const [type, setType] = useState(initialValues.salesOrderLineType);
  const [locationId, setLocationId] = useState(defaults.locationId ?? "");
  const [partData, setPartData] = useState<{
    partId: string;
    description: string;
    unitPrice: number;
    uom: string;
    shelfId: string;
  }>({
    partId: initialValues.partId ?? "",
    description: initialValues.description ?? "",
    unitPrice: initialValues.unitPrice ?? 0,
    uom: initialValues.unitOfMeasureCode ?? "",
    shelfId: initialValues.shelfId ?? "",
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
    ? !permissions.can("update", "sales")
    : !permissions.can("create", "sales");

  const salesOrderLineTypeOptions = salesOrderLineType.map((type) => ({
    label: type,
    value: type,
  }));

  const onClose = () => navigate(-1);

  const onTypeChange = (type: SalesOrderLineType) => {
    setType(type);
    setPartData({
      partId: "",
      description: "",
      unitPrice: 0,
      uom: "EA",
      shelfId: "",
    });
  };

  const onPartChange = async (partId: string) => {
    if (!supabase) return;
    const [part, shelf, price] = await Promise.all([
      supabase
        .from("part")
        .select("name, unitOfMeasureCode")
        .eq("id", partId)
        .single(),
      supabase
        .from("partInventory")
        .select("defaultShelfId")
        .eq("partId", partId)
        .eq("locationId", locationId)
        .maybeSingle(),
      supabase
        .from("partUnitSalePrice")
        .select("unitSalePrice")
        .eq("partId", partId)
        .single(),
    ]);

    setPartData({
      partId,
      description: part.data?.name ?? "",
      unitPrice: price.data?.unitSalePrice ?? 0,
      uom: part.data?.unitOfMeasureCode ?? "EA",
      shelfId: shelf.data?.defaultShelfId ?? "",
    });
  };

  const onServiceChange = async (serviceId: string) => {
    if (!supabase) return;
    const service = await supabase
      .from("service")
      .select("name")
      .eq("id", serviceId)
      .single();

    setPartData({
      partId: "",
      description: service.data?.name ?? "",
      unitPrice: 0,
      uom: "EA",
      shelfId: "",
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
          validator={salesOrderLineValidator}
          method="post"
          action={
            isEditing
              ? path.to.salesOrderLine(orderId, initialValues.id!)
              : path.to.newSalesOrderLine(orderId)
          }
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit" : "New"} Sales Order Line
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Hidden name="id" />
            <Hidden name="salesOrderId" />

            <VStack spacing={4}>
              <Select
                name="salesOrderLineType"
                label="Type"
                options={salesOrderLineTypeOptions}
                onChange={(value) => {
                  onTypeChange(value?.value as SalesOrderLineType);
                }}
              />
              {type === "Part" && (
                <Part
                  name="partId"
                  label="Part"
                  partReplenishmentSystem="Buy and Make"
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
              <InputControlled
                name="description"
                label="Description"
                value={partData.description}
                onChange={(newValue) =>
                  setPartData((d) => ({ ...d, description: newValue }))
                }
              />
              {type !== "Comment" && (
                <>
                  <Number name="salesQuantity" label="Quantity" />
                  {/* 
                // TODO: implement this and replace the UoM in PartForm */}
                  {/* <UnitOfMeasure name="unitOfMeasureCode" label="Unit of Measure" value={uom} /> */}
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
                            shelfId: newValue?.value as string,
                          }));
                        }
                      }}
                    />
                  )}
                </>
              )}
              <CustomFormFields table="salesOrderLine" />
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

export default SalesOrderLineForm;
