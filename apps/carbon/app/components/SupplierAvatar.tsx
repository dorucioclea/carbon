import type { AvatarProps } from "@carbon/react";
import { HStack } from "@carbon/react";
import { useSuppliers } from "~/stores";
import Avatar from "./Avatar";

type SupplierAvatarProps = AvatarProps & {
  supplierId: string | null;
};

const SupplierAvatar = ({
  supplierId,
  size,
  ...props
}: SupplierAvatarProps) => {
  const [suppliers] = useSuppliers();

  if (!supplierId) return null;

  const supplier = suppliers.find((s) => s.id === supplierId) ?? {
    name: "",
    id: "",
  };

  return (
    <HStack className="truncate">
      <Avatar size={size ?? "xs"} {...props} name={supplier?.name ?? ""} />
      <span>{supplier.name}</span>
    </HStack>
  );
};

export default SupplierAvatar;
