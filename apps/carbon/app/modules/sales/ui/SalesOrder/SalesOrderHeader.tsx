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
  HStack,
  Menubar,
  VStack,
} from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { useParams } from "@remix-run/react";
import { useMemo } from "react";
import { Assign, EmployeeAvatar, useOptimisticAssignment } from "~/components";
import { usePermissions, useRouteData } from "~/hooks";
import type { SalesOrder } from "~/modules/sales";
import { SalesStatus, useSalesOrderTotals } from "~/modules/sales";
import { useCustomers } from "~/stores";
import { path } from "~/utils/path";
// import { useSalesOrder } from "../SalesOrders/useSalesOrder";

const SalesOrderHeader = () => {
  const permissions = usePermissions();
  const { orderId } = useParams();
  if (!orderId) throw new Error("Could not find orderId");

  const routeData = useRouteData<{ salesOrder: SalesOrder }>(
    path.to.salesOrder(orderId)
  );

  if (!routeData?.salesOrder) throw new Error("salesOrder not found");

  const [salesOrderTotals] = useSalesOrderTotals();

  // TODO: factor in default currency, po currency and exchange rate
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  //const { receive, invoice } = useSalesOrder();

  const optimisticAssignment = useOptimisticAssignment({
    id: orderId,
    table: "salesOrder",
  });
  const assignee =
    optimisticAssignment !== undefined
      ? optimisticAssignment
      : routeData?.salesOrder?.assignee;

  const [customers] = useCustomers();
  const customer = customers.find(
    (c) => c.id === routeData.salesOrder?.customerId
  );

  return (
    <>
      <VStack>
        {permissions.is("employee") && (
          <Menubar>
            <Assign
              id={orderId}
              table="salesOrder"
              value={assignee ?? undefined}
            />
            {/*<MenubarItem asChild>
              <a
                target="_blank"
                href={path.to.file.salesOrder(orderId)}
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
            </MenubarItem>*/}
            {/*<MenubarItem
              onClick={() => {
                receive(routeData.salesOrder);
              }}
              isDisabled={
                routeData?.salesOrder?.status !== "To Receive" &&
                routeData?.salesOrder?.status !== "To Receive and Invoice"
              }
            >
              Receive
            </MenubarItem>
            <MenubarItem
              onClick={() => {
                invoice(routeData.salesOrder);
              }}
              isDisabled={
                routeData?.salesOrder?.status !== "To Invoice" &&
                routeData?.salesOrder?.status !== "To Receive and Invoice"
              }
            >
              Invoice
            </MenubarItem>*/}
          </Menubar>
        )}

        <Card>
          <HStack className="justify-between items-start">
            <CardHeader>
              <CardTitle>{routeData?.salesOrder?.salesOrderId}</CardTitle>
              <CardDescription>
                {customer ? customer.name : "-"}
              </CardDescription>
            </CardHeader>
            <CardAction>
              {/* <Button
                variant="secondary"
                onClick={() => alert("TODO")}
                leftIcon={<FaHistory />}
              >
                Customer Details
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
                  {formatDate(routeData?.salesOrder?.orderDate)}
                </CardAttributeValue>
              </CardAttribute>
              <CardAttribute>
                <CardAttributeLabel>Status</CardAttributeLabel>
                <SalesStatus status={routeData?.salesOrder?.status} />
              </CardAttribute>
              <CardAttribute>
                <CardAttributeLabel>Total</CardAttributeLabel>
                <CardAttributeValue>
                  {formatter.format(salesOrderTotals?.total ?? 0)}
                </CardAttributeValue>
              </CardAttribute>
            </CardAttributes>
          </CardContent>
        </Card>
      </VStack>
      {/*releaseDisclosure.isOpen && (
        <SalesOrderReleaseModal
          salesOrder={routeData?.salesOrder}
          onClose={releaseDisclosure.onClose}
        />
      )*/}
    </>
  );
};

export default SalesOrderHeader;
