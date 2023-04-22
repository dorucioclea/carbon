import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import { Hidden, Input, Select, Submit, TextArea } from "~/components/Form";
import { usePermissions } from "~/hooks";
import { partGroupValidator } from "~/modules/parts";
import type { TypeOfValidator } from "~/types/validators";
import { mapRowsToOptions } from "~/utils/form";

type PartGroupFormProps = {
  initialValues: TypeOfValidator<typeof partGroupValidator>;
  accounts: {
    number: string;
    name: string;
  }[];
};

const PartGroupForm = ({ accounts, initialValues }: PartGroupFormProps) => {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "parts")
    : !permissions.can("create", "parts");

  const accountOptions = mapRowsToOptions({
    data: accounts,
    value: "number",
    label: "name",
  });

  return (
    <Drawer onClose={onClose} isOpen={true} size="sm">
      <ValidatedForm
        validator={partGroupValidator}
        method="post"
        action={
          isEditing
            ? `/x/parts/groups/${initialValues.id}`
            : "/x/parts/groups/new"
        }
        defaultValues={initialValues}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{isEditing ? "Edit" : "New"} Part Group</DrawerHeader>
          <DrawerBody pb={8}>
            <Hidden name="id" />
            <VStack spacing={4} alignItems="start">
              <Input name="name" label="Part Group" />
              <TextArea name="description" label="Description" />
              {permissions.has("accounting") && (
                <>
                  <Select
                    name="salesAccountId"
                    label="Sales Account"
                    options={accountOptions}
                  />
                  <Select
                    name="discountAccountId"
                    label="Discount Account"
                    options={accountOptions}
                  />
                  <Select
                    name="inventoryAccountId"
                    label="Inventory Account"
                    options={accountOptions}
                  />
                </>
              )}
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack spacing={2}>
              <Submit isDisabled={isDisabled}>Save</Submit>
              <Button
                size="md"
                colorScheme="gray"
                variant="solid"
                onClick={onClose}
              >
                Cancel
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </ValidatedForm>
    </Drawer>
  );
};

export default PartGroupForm;
