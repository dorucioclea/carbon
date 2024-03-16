import { getColor } from "@carbon/utils";
import type { BadgeProps } from "./Badge";
import { Badge } from "./Badge";

type EnumerableProps = BadgeProps & {
  value: string | null;
};

const Enumerable = ({ value, ...props }: EnumerableProps) => {
  if (!value) return null;
  return (
    <Badge style={getColor(value)} {...props}>
      {value}
    </Badge>
  );
};

export { Enumerable };
