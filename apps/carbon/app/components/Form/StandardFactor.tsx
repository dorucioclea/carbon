import { standardFactorType } from "~/modules/shared";
import type { SelectProps } from "./Select";
import Select from "./Select";

export type StandardFactorSelectProps = Omit<SelectProps, "options">;

const StandardFactor = (props: StandardFactorSelectProps) => {
  return (
    <Select
      {...props}
      options={standardFactorType.map((t) => ({ value: t, label: t }))}
    />
  );
};

export default StandardFactor;
