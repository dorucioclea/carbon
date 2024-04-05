import { useParams } from "@remix-run/react";
import { DetailSidebar } from "~/components/Layout";
import { useRouteData } from "~/hooks";
import type {
  SalesOrder,
  //SalesOrderAttachment,
  SalesOrderLine,
} from "~/modules/sales";
import { path } from "~/utils/path";
import { useSalesOrderSidebar } from "./useSalesOrderSidebar";

const SalesOrderSidebar = () => {
  const { orderId } = useParams();

  if (!orderId)
    throw new Error(
      "SalesOrderSidebar requires an orderId and could not find orderId in params"
    );

  const routeData = useRouteData<{
    salesOrder: SalesOrder;
    salesOrderLines: SalesOrderLine[];
    /*internalDocuments: SalesOrderAttachment[];
    externalDocuments: SalesOrderAttachment[];*/
  }>(path.to.salesOrder(orderId));

  const links = useSalesOrderSidebar({
    lines: routeData?.salesOrderLines.length ?? 0,
    internalDocuments: 0, // routeData?.internalDocuments.length ?? 0,
    externalDocuments: 0, //routeData?.externalDocuments.length ?? 0,
  });

  return <DetailSidebar links={links} />;
};

export default SalesOrderSidebar;
