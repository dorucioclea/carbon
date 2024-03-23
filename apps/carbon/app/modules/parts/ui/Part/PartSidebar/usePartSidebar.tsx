import { useParams } from "@remix-run/react";
import { BiListCheck } from "react-icons/bi";
import { BsBank, BsBarChartLineFill, BsCartDash } from "react-icons/bs";
import { HiOutlineCube } from "react-icons/hi";
import { IoPricetagsOutline } from "react-icons/io5";
import { PiMoneyFill, PiShareNetworkFill } from "react-icons/pi";
import { usePermissions } from "~/hooks";
import type { PartReplenishmentSystem } from "~/modules/parts/types";
import type { Role } from "~/types";
import { path } from "~/utils/path";

export function usePartSidebar(replenishment: PartReplenishmentSystem) {
  const permissions = usePermissions();
  const { partId } = useParams();
  if (!partId) throw new Error("partId not found");

  return [
    {
      name: "Details",
      to: path.to.partDetails(partId),
      icon: BsBank,
      shortcut: "Command+Shift+d",
    },
    {
      name: "Purchasing",
      to: path.to.partPurchasing(partId),
      isDisabled: replenishment === "Make",
      role: ["employee", "supplier"],
      icon: BsCartDash,
      shortcut: "Command+Shift+p",
    },
    {
      name: "Suppliers",
      to: path.to.partSuppliers(partId),
      isDisabled: replenishment === "Make",
      role: ["employee", "supplier"],
      icon: PiShareNetworkFill,
      shortcut: "Command+Shift+s",
    },
    {
      name: "Manufacturing",
      to: path.to.partManufacturing(partId),
      isDisabled: replenishment === "Buy",
      role: ["employee"],
      icon: BiListCheck,
      shortcut: "Command+Shift+m",
    },
    {
      name: "Costing",
      to: path.to.partCosting(partId),
      role: ["employee", "supplier"],
      icon: IoPricetagsOutline,
      shortcut: "Command+Shift+c",
    },
    {
      name: "Planning",
      to: path.to.partPlanning(partId),
      role: ["employee"],
      icon: BsBarChartLineFill,
      shortcut: "Command+Shift+p",
    },
    {
      name: "Inventory",
      to: path.to.partInventory(partId),
      role: ["employee", "supplier"],
      icon: HiOutlineCube,
      shortcut: "Command+Shift+i",
    },
    {
      name: "Sale Price",
      to: path.to.partSalePrice(partId),
      role: ["employee", "customer"],
      icon: PiMoneyFill,
      shortcut: "Command+Shift+x",
    },
  ].filter(
    (item) =>
      !item.isDisabled &&
      (item.role === undefined ||
        item.role.some((role) => permissions.is(role as Role)))
  );
}
