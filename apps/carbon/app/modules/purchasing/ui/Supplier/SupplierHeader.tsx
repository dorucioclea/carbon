import {
  Card,
  CardAction,
  CardAttribute,
  CardAttributeLabel,
  CardAttributeValue,
  CardAttributes,
  CardContent,
  CardHeader,
  CardTitle,
  Enumerable,
  HStack,
  Menubar,
  VStack,
} from "@carbon/react";

import { useParams } from "@remix-run/react";
import { Assign, EmployeeAvatar, useOptimisticAssignment } from "~/components";
import { usePermissions, useRouteData } from "~/hooks";
import type {
  SupplierDetail,
  SupplierStatus,
  SupplierType,
} from "~/modules/purchasing";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

const SupplierHeader = () => {
  const permissions = usePermissions();
  const { supplierId } = useParams();

  if (!supplierId) throw new Error("Could not find supplierId");
  const routeData = useRouteData<{ supplier: SupplierDetail }>(
    path.to.supplier(supplierId)
  );

  const sharedSupplierData = useRouteData<{
    supplierTypes: SupplierType[];
    supplierStatuses: SupplierStatus[];
    paymentTerms: ListItem[];
  }>(path.to.supplierRoot);

  const supplierStatus = sharedSupplierData?.supplierStatuses?.find(
    (status) => status.id === routeData?.supplier?.supplierStatusId
  )?.name;

  const supplierType = sharedSupplierData?.supplierTypes?.find(
    (type) => type.id === routeData?.supplier?.supplierTypeId
  )?.name;

  const optimisticAssignment = useOptimisticAssignment({
    id: supplierId,
    table: "supplier",
  });
  const assignee =
    optimisticAssignment !== undefined
      ? optimisticAssignment
      : routeData?.supplier?.assignee;

  return (
    <VStack>
      {permissions.is("employee") && (
        <Menubar>
          <Assign
            id={supplierId}
            table="supplier"
            value={routeData?.supplier?.assignee ?? ""}
          />
        </Menubar>
      )}
      <Card>
        <HStack className="justify-between items-start">
          <CardHeader>
            <CardTitle>{routeData?.supplier?.name}</CardTitle>
          </CardHeader>
          <CardAction>
            {/* <Button onClick={() => alert("TODO")} leftIcon={<FaHistory />}>
              Supplier Details
            </Button> */}
          </CardAction>
        </HStack>
        <CardContent>
          <CardAttributes>
            <CardAttribute>
              <CardAttributeLabel>Account Manager</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.supplier?.accountManagerId ? (
                  <EmployeeAvatar
                    employeeId={routeData?.supplier?.accountManagerId ?? null}
                  />
                ) : (
                  "-"
                )}
              </CardAttributeValue>
            </CardAttribute>
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
              <CardAttributeLabel>Type</CardAttributeLabel>
              <CardAttributeValue>
                {supplierType ? <Enumerable value={supplierType!} /> : "-"}
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Status</CardAttributeLabel>
              <CardAttributeValue>
                {supplierStatus ? <Enumerable value={supplierStatus!} /> : "-"}
              </CardAttributeValue>
            </CardAttribute>
          </CardAttributes>
        </CardContent>
      </Card>
    </VStack>
  );
};

export default SupplierHeader;
