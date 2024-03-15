import { useDisclosure, useMount } from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import { useMemo, useRef, useState } from "react";
import type { getPartGroupsList } from "~/modules/parts";
import { PartGroupForm } from "~/modules/parts";
import { path } from "~/utils/path";
import type { ComboboxProps } from "./Combobox";
import CreatableCombobox from "./CreatableCombobox";

type PartGroupSelectProps = Omit<ComboboxProps, "options">;

const PartGroup = (props: PartGroupSelectProps) => {
  const partGroupFetcher =
    useFetcher<Awaited<ReturnType<typeof getPartGroupsList>>>();

  const newPartGroupModal = useDisclosure();
  const [created, setCreated] = useState<string>("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  useMount(() => {
    partGroupFetcher.load(path.to.api.partGroups);
  });

  const options = useMemo(
    () =>
      partGroupFetcher.data?.data
        ? partGroupFetcher.data?.data.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        : [],
    [partGroupFetcher.data]
  );

  return (
    <>
      <CreatableCombobox
        ref={triggerRef}
        options={options}
        {...props}
        label={props?.label ?? "Part Group"}
        onCreateOption={(option) => {
          newPartGroupModal.onOpen();
          setCreated(option);
        }}
      />
      {newPartGroupModal.isOpen && (
        <PartGroupForm
          type="modal"
          onClose={() => {
            setCreated("");
            newPartGroupModal.onClose();
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

PartGroup.displayName = "PartGroup";

export default PartGroup;
