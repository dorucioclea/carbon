import { useDisclosure } from "@carbon/react";
import { useMemo, useRef, useState } from "react";
import { PartForm, type PartReplenishmentSystem } from "~/modules/parts";
import { useParts } from "~/stores";
import type { ComboboxProps } from "./Combobox";
import CreatableCombobox from "./CreatableCombobox";

type PartSelectProps = Omit<ComboboxProps, "options"> & {
  partReplenishmentSystem?: PartReplenishmentSystem;
};

const Part = ({ partReplenishmentSystem, ...props }: PartSelectProps) => {
  const [parts] = useParts();
  const newPartsModal = useDisclosure();
  const [created, setCreated] = useState<string>("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const options = useMemo(
    () =>
      parts
        .filter((part) => {
          if (partReplenishmentSystem === "Buy") {
            return ["Buy", "Buy and Make"].includes(part.replenishmentSystem);
          } else if (partReplenishmentSystem === "Make") {
            return ["Make", "Buy and Make"].includes(part.replenishmentSystem);
          } else {
            return true;
          }
        })
        .map((part) => ({
          value: part.id,
          label: part.id,
          helper: part.name,
        })) ?? [],
    [partReplenishmentSystem, parts]
  );

  return (
    <>
      <CreatableCombobox
        ref={triggerRef}
        options={options}
        {...props}
        label={props?.label ?? "Part"}
        onCreateOption={(option) => {
          newPartsModal.onOpen();
          setCreated(option);
        }}
      />
      {newPartsModal.isOpen && (
        <PartForm
          type="modal"
          onClose={() => {
            setCreated("");
            newPartsModal.onClose();
            triggerRef.current?.click();
          }}
          initialValues={{
            id: "",
            name: created,
            description: "",
            partType: "Inventory" as "Inventory",
            replenishmentSystem: "Buy" as "Buy",
            unitOfMeasureCode: "EA",
            blocked: false,
            active: false,
          }}
        />
      )}
    </>
  );
};

Part.displayName = "Part";

export default Part;
