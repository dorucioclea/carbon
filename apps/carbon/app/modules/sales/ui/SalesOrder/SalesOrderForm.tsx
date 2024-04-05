import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  VStack,
  cn,
} from "@carbon/react";
import { ValidatedForm } from "@carbon/remix-validated-form";
import { useState } from "react";
import type { z } from "zod";
import {
  CustomFormFields,
  DatePicker,
  Hidden,
  Input,
  Select,
  Submit,
  Customer,
  CustomerContact,
  CustomerLocation,
  TextArea,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import {
  salesOrderStatusType,
  salesOrderValidator,
} from "~/modules/sales";

type SalesOrderFormValues = z.infer<typeof salesOrderValidator>;

type SalesOrderFormProps = {
  initialValues: SalesOrderFormValues;
};

const SalesOrderForm = ({ initialValues }: SalesOrderFormProps) => {
  const permissions = usePermissions();
  const [customer, setCustomer] = useState<string | undefined>(
    initialValues.customerId
  );
  const isEditing = initialValues.id !== undefined;
  const isCustomer = permissions.is("customer");

  const statusOptions = salesOrderStatusType.map((status) => ({
    label: status,
    value: status,
  }));

  return (
    <ValidatedForm
      method="post"
      validator={salesOrderValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Sales Order" : "New Sales Order"}
          </CardTitle>
          {!isEditing && (
            <CardDescription>
              A sales order contains information about the agreement between
              the company and a specific customer for parts and services.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Hidden name="salesOrderId" />
          <VStack>
            <div
              className={cn(
                "grid w-full gap-x-8 gap-y-2",
                isEditing ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
              )}
            >
              <Customer
                autoFocus={!isEditing}
                name="customerId"
                label="Customer"
                onChange={(newValue) =>
                  setCustomer(newValue?.value as string | undefined)
                }
              />
              <Input name="customerReference" label="Customer Order Number" />
              {isEditing && permissions.can("delete", "sales") && (
                <Select
                  name="status"
                  label="Status"
                  value={initialValues.status}
                  options={statusOptions}
                  isReadOnly={isCustomer}
                />
              )}
              <CustomerLocation
                name="customerLocationId"
                label="Customer Location"
                customer={customer}
              />
              <CustomerContact
                name="customerContactId"
                label="Customer Contact"
                customer={customer}
              />

              <DatePicker
                name="orderDate"
                label="Order Date"
                isDisabled={isCustomer}
              />

              {isEditing && (
                <TextArea name="notes" label="Notes" readOnly={isCustomer} />
              )}
              <CustomFormFields table="salesOrder" />
            </div>
          </VStack>
        </CardContent>
        <CardFooter>
          <Submit
            isDisabled={
              isEditing
                ? !permissions.can("update", "sales")
                : !permissions.can("create", "sales")
            }
          >
            Save
          </Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default SalesOrderForm;
