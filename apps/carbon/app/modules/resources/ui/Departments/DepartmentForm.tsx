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
import { useFetcher } from "@remix-run/react";
import type { z } from "zod";
import { Color, Department, Hidden, Input, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import { departmentValidator } from "~/modules/resources";
import { path } from "~/utils/path";

type DepartmentFormProps = {
  initialValues: z.infer<typeof departmentValidator>;
  type?: "modal" | "drawer";
  open?: boolean;
  onClose: (data?: { id: string; name: string }) => void;
};

const DepartmentForm = ({
  initialValues,
  open = true,
  type = "drawer",
  onClose,
}: DepartmentFormProps) => {
  const permissions = usePermissions();
  const fetcher = useFetcher();

  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "resources")
    : !permissions.can("create", "resources");

  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DrawerContent>
        <ValidatedForm
          validator={departmentValidator}
          method="post"
          action={
            isEditing
              ? path.to.department(initialValues.id!)
              : path.to.newDepartment
          }
          defaultValues={initialValues}
          fetcher={fetcher}
          className="flex flex-col h-full"
          onSubmit={() => {
            if (type === "modal") {
              onClose();
            }
          }}
        >
          <DrawerHeader>
            <DrawerTitle>{isEditing ? "Edit" : "New"} Department</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Hidden name="id" />
            <Hidden name="type" value={type} />
            <VStack spacing={4}>
              <Input name="name" label="Department Name" />
              <Color name="color" label="Color" />
              <Department name="parentDepartmentId" label="Parent Department" />
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack>
              <Submit isDisabled={isDisabled}>Save</Submit>
              <Button size="md" variant="solid" onClick={() => onClose()}>
                Cancel
              </Button>
            </HStack>
          </DrawerFooter>
        </ValidatedForm>
      </DrawerContent>
    </Drawer>
  );
};

export default DepartmentForm;
