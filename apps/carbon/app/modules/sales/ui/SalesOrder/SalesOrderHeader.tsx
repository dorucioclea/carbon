import {
  Card,
  CardAction,
  CardAttribute,
  CardAttributeLabel,
  CardAttributeValue,
  CardAttributes,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Enumerable,
  HStack,
  Menubar,
  MenubarItem,
  VStack,
  useDisclosure,
} from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { useParams } from "@remix-run/react";
import { useMemo } from "react";
import { Assign, EmployeeAvatar, useOptimisticAssignment } from "~/components";
import { usePermissions, useRouteData } from "~/hooks";
import type { PurchaseOrder } from "~/modules/purchasing";
import { PurchasingStatus, usePurchaseOrderTotals } from "~/modules/purchasing";
import { useSuppliers } from "~/stores";
import { path } from "~/utils/path";
import { usePurchaseOrder } from "../SalesOrders/useSalesOrder";
import PurchaseOrderReleaseModal from "./SalesOrderReleaseModal";

const PurchaseOrderHeader = () => {
  const permissions = usePermissions();
  const { orderId } = useParams();
  if (!orderId) throw new Error("Could not find orderId");

  const routeData = useRouteData<{ purchaseOrder: PurchaseOrder }>(
    path.to.purchaseOrder(orderId)
  );

  if (!routeData?.purchaseOrder) throw new Error("purchaseOrder not found");
  const isReleased = !["Draft", "Approved"].includes(
    routeData?.purchaseOrder?.status ?? ""
  );

  const [purchaseOrderTotals] = usePurchaseOrderTotals();

  // TODO: factor in default currency, po currency and exchange rate
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  const { receive, invoice } = usePurchaseOrder();
  const releaseDisclosure = useDisclosure();

  const optimisticAssignment = useOptimisticAssignment({
    id: orderId,
    table: "purchaseOrder",
  });
  const assignee =
    optimisticAssignment !== undefined
      ? optimisticAssignment
      : routeData?.purchaseOrder?.assignee;

  const [suppliers] = useSuppliers();
  const supplier = suppliers.find(
    (s) => s.id === routeData.purchaseOrder?.supplierId
  );

  return (
    <>
      <VStack>
        {permissions.is("employee") && (
          <Menubar>
            <Assign
              id={orderId}
              table="purchaseOrder"
              value={assignee ?? undefined}
            />
            <MenubarItem asChild>
              <a
                target="_blank"
                href={path.to.file.purchaseOrder(orderId)}
                rel="noreferrer"
              >
                Preview
              </a>
            </MenubarItem>

            <MenubarItem
              onClick={releaseDisclosure.onOpen}
              isDisabled={isReleased}
            >
              Release
            </MenubarItem>
            <MenubarItem
              onClick={() => {
                receive(routeData.purchaseOrder);
              }}
              isDisabled={
                routeData?.purchaseOrder?.status !== "To Receive" &&
                routeData?.purchaseOrder?.status !== "To Receive and Invoice"
              }
            >
              Receive
            </MenubarItem>
            <MenubarItem
              onClick={() => {
                invoice(routeData.purchaseOrder);
              }}
              isDisabled={
                routeData?.purchaseOrder?.status !== "To Invoice" &&
                routeData?.purchaseOrder?.status !== "To Receive and Invoice"
              }
            >
              Invoice
            </MenubarItem>
          </Menubar>
        )}

        <Card>
          <HStack className="justify-between items-start">
            <CardHeader>
              <CardTitle>{routeData?.purchaseOrder?.purchaseOrderId}</CardTitle>
              <CardDescription>
                {supplier ? supplier.name : "-"}
              </CardDescription>
            </CardHeader>
            <CardAction>
              {/* <Button
                variant="secondary"
                onClick={() => alert("TODO")}
                leftIcon={<FaHistory />}
              >
                Supplier Details
              </Button> */}
            </CardAction>
          </HStack>
          <CardContent>
            <CardAttributes>
              <CardAttribute>
                <CardAttributeLabel>Assignee</CardAttributeLabel>
                <CardAttributeValue>
                  {assignee ? (
                    <EmployeeAvatar employeeId={assignee ?? null} />
                  ) : (
                    "-"
                  )}
                </CardAttributeValue>
              </CardAttribute>

              <CardAttribute>
                <CardAttributeLabel>Order Date</CardAttributeLabel>
                <CardAttributeValue>
                  {formatDate(routeData?.purchaseOrder?.orderDate)}
                </CardAttributeValue>
              </CardAttribute>

              <CardAttribute>
                <CardAttributeLabel>Promised Date</CardAttributeLabel>
                <CardAttributeValue>
                  {formatDate(routeData?.purchaseOrder?.receiptPromisedDate)}
                </CardAttributeValue>
              </CardAttribute>
              <CardAttribute>
                <CardAttributeLabel>Type</CardAttributeLabel>
                <CardAttributeValue>
                  <Enumerable value={routeData?.purchaseOrder?.type} />
                </CardAttributeValue>
              </CardAttribute>
              <CardAttribute>
                <CardAttributeLabel>Status</CardAttributeLabel>
                <PurchasingStatus status={routeData?.purchaseOrder?.status} />
              </CardAttribute>
              <CardAttribute>
                <CardAttributeLabel>Total</CardAttributeLabel>
                <CardAttributeValue>
                  {formatter.format(purchaseOrderTotals?.total ?? 0)}
                </CardAttributeValue>
              </CardAttribute>
            </CardAttributes>
          </CardContent>
        </Card>
      </VStack>
      {releaseDisclosure.isOpen && (
        <PurchaseOrderReleaseModal
          purchaseOrder={routeData?.purchaseOrder}
          onClose={releaseDisclosure.onClose}
        />
      )}
    </>
  );
};

export default PurchaseOrderHeader;
