import { HStack } from "@carbon/react";
import { TableFilters } from "~/components/Layout";
import { DebouncedInput } from "~/components/Search";

const CustomFieldsTableFilters = () => {
  return (
    <TableFilters>
      <HStack>
        <DebouncedInput param="name" size="sm" placeholder="Search" />
      </HStack>
    </TableFilters>
  );
};

export default CustomFieldsTableFilters;
