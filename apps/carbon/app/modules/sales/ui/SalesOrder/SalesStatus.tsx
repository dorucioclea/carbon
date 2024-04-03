import { Status } from "@carbon/react";
import type { salesOrderStatusType } from "~/modules/sales";

type SalesOrderStatusProps = {
  status?: (typeof salesOrderStatusType)[number] | null;
};

const SalesStatus = ({ status }: SalesOrderStatusProps) => {
  switch (status) {
    case "Draft":
      return <Status color="gray">{status}</Status>;
    case "Cancelled":
      return <Status color="yellow">{status}</Status>;
    case "Confirmed":
    case "In Progress":
    case "Invoiced":
    case "Needs Approval":
      return <Status color="orange">{status}</Status>;
    case "Completed":
      return <Status color="green">{status}</Status>;
    default:
      return null;
  }
};

export default SalesStatus;
