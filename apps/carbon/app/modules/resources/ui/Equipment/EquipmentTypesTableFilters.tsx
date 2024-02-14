import { HStack } from "@carbon/react";
import { New } from "~/components";
import { TableFilters } from "~/components/Layout";
import { DebouncedInput } from "~/components/Search";
import { usePermissions, useUrlParams } from "~/hooks";

const EquipmentTypesTableFilters = () => {
  const permissions = usePermissions();
  const [params] = useUrlParams();

  return (
    <TableFilters>
      <HStack>
        <DebouncedInput param="name" size="sm" placeholder="Search" />
      </HStack>
      <HStack>
        {permissions.can("update", "resources") && (
          <New label="Equipment Type" to={`new?${params.toString()}`} />
        )}
      </HStack>
    </TableFilters>
  );
};

export default EquipmentTypesTableFilters;
