import { useNavigate } from "@remix-run/react";
import { useCallback } from "react";
import type { SalesOrder } from "~/modules/sales";
import { path } from "~/utils/path";

export const useSalesOrder = () => {
  const navigate = useNavigate();

  const edit = useCallback(
    (salesOrder: SalesOrder) => navigate(path.to.salesOrder(salesOrder.id!)),
    [navigate]
  );

  /*const invoice = useCallback(
    (salesOrder: SalesOrder) =>
      navigate(
        `${path.to.newPurchaseInvoice}?sourceDocument=Purchase Order&sourceDocumentId=${purchaseOrder.id}`
      ),
    [navigate]
  );

  const receive = useCallback(
    (salesOrder: SalesOrder) =>
      navigate(
        `${path.to.newReceipt}?sourceDocument=Purchase Order&sourceDocumentId=${salesOrder.id}`
      ),
    [navigate]
  );*/

  return {
    edit,
    //invoice,
    //receive,
  };
};
