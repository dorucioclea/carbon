import { useDisclosure } from "@carbon/react";
import { useMemo, useRef, useState } from "react";
import { SupplierForm } from "~/modules/purchasing";
import { useSuppliers } from "~/stores";
import type { ComboboxProps } from "./Combobox";
import CreatableCombobox from "./CreatableCombobox";

type SupplierSelectProps = Omit<ComboboxProps, "options">;

const Supplier = (props: SupplierSelectProps) => {
  const [suppliers] = useSuppliers();
  const newSuppliersModal = useDisclosure();
  const [created, setCreated] = useState<string>("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const options = useMemo(
    () =>
      suppliers.map((c) => ({
        value: c.id,
        label: c.name,
      })) ?? [],
    [suppliers]
  );

  return (
    <>
      <CreatableCombobox
        ref={triggerRef}
        options={options}
        {...props}
        label={props?.label ?? "Supplier"}
        onCreateOption={(option) => {
          newSuppliersModal.onOpen();
          setCreated(option);
        }}
      />
      {newSuppliersModal.isOpen && (
        <SupplierForm
          type="modal"
          onClose={() => {
            setCreated("");
            newSuppliersModal.onClose();
            triggerRef.current?.click();
          }}
          initialValues={{
            name: created,
          }}
        />
      )}
    </>
  );
};

Supplier.displayName = "Supplier";

export default Supplier;
