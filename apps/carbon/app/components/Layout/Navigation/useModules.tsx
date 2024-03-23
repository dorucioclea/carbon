import { AiOutlinePartition } from "react-icons/ai";
import {
  BsCartDash,
  BsCartPlus,
  BsCreditCard,
  BsPeopleFill,
  BsShieldLock,
} from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { HiOutlineCube, HiOutlineDocumentDuplicate } from "react-icons/hi";
import { LuSettings2 } from "react-icons/lu";
import { TbPigMoney } from "react-icons/tb";
import { usePermissions } from "~/hooks";
import type { Authenticated, NavItem } from "~/types";
import { path } from "~/utils/path";

export function useModules() {
  const permissions = usePermissions();

  const modules: Authenticated<NavItem>[] = [
    {
      permission: "parts",
      name: "Parts",
      to: path.to.partsSearch,
      icon: AiOutlinePartition,
    },
    // {
    //   permission: "jobs",
    //   name: "Jobs",
    //   to: path.to.jobs,
    //   icon: BiListCheck,
    // },
    {
      permission: "inventory",
      name: "Inventory",
      to: path.to.receipts,
      icon: HiOutlineCube,
    },
    // {
    //   permission: "scheduling",
    //   name: "Scheduling",
    //   to: path.to.scheduling,
    //   icon: BsCalendar2Week,
    // },
    // {
    //   permission: "timecards",
    //   name: "Timecards",
    //   to: path.to.timecards,
    //   icon: AiOutlineFieldTime,
    // },
    {
      permission: "sales",
      name: "Sales",
      to: path.to.quotes,
      icon: BsCartPlus,
    },
    {
      permission: "purchasing",
      name: "Purchasing",
      to: path.to.purchaseOrders,
      icon: BsCartDash,
    },
    {
      permission: "documents",
      name: "Documents",
      to: path.to.documents,
      icon: HiOutlineDocumentDuplicate,
    },
    // {
    //   permission: "messages",
    //   name: "Messaging",
    //   to: path.to.messaging,
    //   icon: BiMessage,
    // },
    {
      permission: "accounting",
      name: "Accounting",
      to: path.to.chartOfAccounts,
      icon: TbPigMoney,
    },
    {
      permission: "invoicing",
      name: "Invoicing",
      to: path.to.purchaseInvoices,
      icon: BsCreditCard,
    },
    {
      permission: "resources",
      name: "Resources",
      to: path.to.people,
      icon: BsPeopleFill,
    },
    {
      permission: "users",
      name: "Users",
      to: path.to.employeeAccounts,
      icon: BsShieldLock,
    },
    {
      permission: "settings",
      name: "Settings",
      to: path.to.company,
      icon: LuSettings2,
    },
    {
      name: "My Account",
      to: path.to.profile,
      icon: CgProfile,
    },
  ];

  return modules.filter((item) => {
    if (item.permission) {
      return permissions.can("view", item.permission);
    } else {
      return true;
    }
  });
}
