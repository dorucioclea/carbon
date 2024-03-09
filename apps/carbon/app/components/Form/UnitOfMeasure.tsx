import { useDisclosure, useMount } from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import { useMemo, useRef, useState } from "react";
import type { getUnitOfMeasuresList } from "~/modules/parts";
import { UnitOfMeasureForm } from "~/modules/parts";
import { path } from "~/utils/path";
import type { ComboboxProps } from "./Combobox";
import CreatableCombobox from "./CreatableCombobox";

type UnitOfMeasureSelectProps = Omit<ComboboxProps, "options">;

const UnitOfMeasure = (props: UnitOfMeasureSelectProps) => {
  const uomFetcher =
    useFetcher<Awaited<ReturnType<typeof getUnitOfMeasuresList>>>();

  const newUnitOfMeasureModal = useDisclosure();
  const [created, setCreated] = useState<string>("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  useMount(() => {
    uomFetcher.load(path.to.api.unitOfMeasures);
  });

  const options = useMemo(
    () =>
      uomFetcher.data?.data
        ? uomFetcher.data?.data.map((c) => ({
            value: c.code,
            label: c.name,
          }))
        : [],
    [uomFetcher.data]
  );

  return (
    <>
      <CreatableCombobox
        ref={triggerRef}
        options={options}
        {...props}
        label={props?.label ?? "Part Group"}
        onCreateOption={(option) => {
          newUnitOfMeasureModal.onOpen();
          setCreated(option);
        }}
      />
      {newUnitOfMeasureModal.isOpen && (
        <UnitOfMeasureForm
          type="modal"
          onClose={() => {
            setCreated("");
            newUnitOfMeasureModal.onClose();
            triggerRef.current?.click();
          }}
          initialValues={{
            name: created,
            code: "",
          }}
        />
      )}
    </>
  );
};

UnitOfMeasure.displayName = "UnitOfMeasure";

export default UnitOfMeasure;
