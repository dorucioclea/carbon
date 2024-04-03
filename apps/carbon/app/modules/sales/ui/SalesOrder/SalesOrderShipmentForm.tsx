import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@carbon/react";
import { ValidatedForm } from "@carbon/remix-validated-form";
import { useState } from "react";
import type { z } from "zod";
import {
  Boolean,
  CustomFormFields,
  Customer,
  CustomerLocation,
  DatePicker,
  Hidden,
  Input,
  Location,
  Select,
  Submit,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import { purchaseOrderDeliveryValidator } from "~/modules/purchasing";
import type { ListItem } from "~/types";

type PurchaseOrderDeliveryFormProps = {
  initialValues: z.infer<typeof purchaseOrderDeliveryValidator>;
  shippingMethods: ListItem[];
  shippingTerms: ListItem[];
};

const PurchaseOrderDeliveryForm = ({
  initialValues,
  shippingMethods,
  shippingTerms,
}: PurchaseOrderDeliveryFormProps) => {
  const permissions = usePermissions();
  const [dropShip, setDropShip] = useState<boolean>(
    initialValues.dropShipment ?? false
  );
  const [customer, setCustomer] = useState<string | undefined>(
    initialValues.customerId
  );

  const shippingMethodOptions = shippingMethods.map((method) => ({
    label: method.name,
    value: method.id,
  }));

  const shippingTermOptions = shippingTerms.map((term) => ({
    label: term.name,
    value: term.id,
  }));

  const isSupplier = permissions.is("supplier");

  return (
    <ValidatedForm
      method="post"
      validator={purchaseOrderDeliveryValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <Hidden name="id" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-2 w-full">
            <Location
              name="locationId"
              label="Delivery Location"
              isReadOnly={isSupplier}
              isClearable
            />
            <Select
              name="shippingMethodId"
              label="Shipping Method"
              options={shippingMethodOptions}
            />
            <Select
              name="shippingTermId"
              label="Shipping Terms"
              isReadOnly={isSupplier}
              options={shippingTermOptions}
            />

            <DatePicker name="receiptRequestedDate" label="Requested Date" />
            <DatePicker name="receiptPromisedDate" label="Promised Date" />
            <DatePicker name="deliveryDate" label="Delivery Date" />

            <Input name="trackingNumber" label="Tracking Number" />
            {/* <TextArea name="notes" label="Shipping Notes" /> */}
            <Boolean
              name="dropShipment"
              label="Drop Shipment"
              onChange={setDropShip}
            />
            {dropShip && (
              <>
                <Customer
                  name="customerId"
                  label="Customer"
                  onChange={(value) => setCustomer(value?.value as string)}
                />
                <CustomerLocation
                  name="customerLocationId"
                  label="Location"
                  customer={customer}
                />
              </>
            )}
            <CustomFormFields table="purchaseOrderDelivery" />
          </div>
        </CardContent>
        <CardFooter>
          <Submit isDisabled={!permissions.can("update", "purchasing")}>
            Save
          </Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default PurchaseOrderDeliveryForm;
