import { useParams } from "@remix-run/react";
import {
  BsBank,
  BsCreditCard,
  BsFillPersonLinesFill,
  BsFillPinMapFill,
  BsTruck,
} from "react-icons/bs";
import { usePermissions } from "~/hooks";
import type { Role } from "~/types";
import { path } from "~/utils/path";

type Props = {
  contacts: number;
  locations: number;
};

export function useCustomerSidebar({ contacts, locations }: Props) {
  const permissions = usePermissions();
  const { customerId } = useParams();
  if (!customerId) throw new Error("customerId not found");
  return [
    {
      name: "Details",
      to: path.to.customerDetails(customerId),
      icon: BsBank,
      shortcut: "Command+Shift+d",
    },
    {
      name: "Contacts",
      to: path.to.customerContacts(customerId),
      role: ["employee"],
      count: contacts,
      icon: BsFillPersonLinesFill,
      shortcut: "Command+Shift+c",
    },
    {
      name: "Locations",
      to: path.to.customerLocations(customerId),
      role: ["employee", "customer"],
      count: locations,
      icon: BsFillPinMapFill,
      shortcut: "Command+Shift+l",
    },
    {
      name: "Payments",
      to: path.to.customerPayment(customerId),
      role: ["employee"],
      icon: BsCreditCard,
      shortcut: "Command+Shift+p",
    },
    {
      name: "Shipping",
      to: path.to.customerShipping(customerId),
      role: ["employee"],
      icon: BsTruck,
      shortcut: "Command+Shift+s",
    },
  ].filter(
    (item) =>
      item.role === undefined ||
      item.role.some((role) => permissions.is(role as Role))
  );
}
