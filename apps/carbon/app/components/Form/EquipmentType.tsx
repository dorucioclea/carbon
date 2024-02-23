import { useMount } from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import { useMemo } from "react";
import type { getEquipmentTypesList } from "~/modules/resources";
import { path } from "~/utils/path";
import type { ComboboxProps } from "./Combobox";
import Combobox from "./Combobox";

type EquipmentTypeSelectProps = Omit<ComboboxProps, "options">;

const EquipmentType = (props: EquipmentTypeSelectProps) => {
  const equipmentTypesFetcher =
    useFetcher<Awaited<ReturnType<typeof getEquipmentTypesList>>>();

  useMount(() => {
    equipmentTypesFetcher.load(path.to.api.equipmentTypes);
  });

  const options = useMemo(
    () =>
      equipmentTypesFetcher.data?.data
        ? equipmentTypesFetcher.data?.data.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        : [],
    [equipmentTypesFetcher.data]
  );

  return (
    <Combobox
      options={options}
      {...props}
      label={props?.label ?? "Equipment Type"}
    />
  );
};

EquipmentType.displayName = "EquipmentType";

export default EquipmentType;
