import { useMount } from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import { useMemo } from "react";
import type { getWorkCellTypesList } from "~/modules/resources";
import { path } from "~/utils/path";
import type { ComboboxProps } from "./Combobox";
import Combobox from "./Combobox";

type WorkCellTypeSelectProps = Omit<ComboboxProps, "options">;

const WorkCellType = (props: WorkCellTypeSelectProps) => {
  const workCellTypesFetcher =
    useFetcher<Awaited<ReturnType<typeof getWorkCellTypesList>>>();

  useMount(() => {
    workCellTypesFetcher.load(path.to.api.workCellTypes);
  });

  const options = useMemo(
    () =>
      workCellTypesFetcher.data?.data
        ? workCellTypesFetcher.data?.data.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        : [],
    [workCellTypesFetcher.data]
  );

  return (
    <Combobox
      options={options}
      {...props}
      label={props?.label ?? "Work Cell Type"}
    />
  );
};

WorkCellType.displayName = "WorkCellType";

export default WorkCellType;
