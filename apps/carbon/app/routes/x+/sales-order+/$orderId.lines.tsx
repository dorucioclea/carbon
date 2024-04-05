import { Outlet } from "@remix-run/react";
import { SalesOrderLines } from "~/modules/sales";

export default function SalesOrderLinesRoute() {
  return (
    <div className="flex flex-col w-full space-x-4 space-y-4">
      <SalesOrderLines />
      <Outlet />
    </div>
  );
}
