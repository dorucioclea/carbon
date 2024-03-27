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
  VStack,
} from "@carbon/react";

import { useParams } from "@remix-run/react";
import { Assign, EmployeeAvatar, useOptimisticAssignment } from "~/components";
import { usePermissions, useRouteData } from "~/hooks";
import type { PartSummary } from "~/modules/parts";
import { path } from "~/utils/path";

const PartHeader = () => {
  const permissions = usePermissions();
  const { partId } = useParams();
  if (!partId) throw new Error("partId not found");

  const routeData = useRouteData<{ partSummary: PartSummary }>(
    path.to.part(partId)
  );

  const optimisticAssignment = useOptimisticAssignment({
    id: partId,
    table: "part",
  });
  const assignee =
    optimisticAssignment !== undefined
      ? optimisticAssignment
      : routeData?.partSummary?.assignee;

  return (
    <VStack>
      {permissions.is("employee") && (
        <Menubar>
          <Assign
            id={partId}
            table="part"
            value={routeData?.partSummary?.assignee ?? ""}
          />
        </Menubar>
      )}
      <Card>
        <HStack className="justify-between items-start">
          <CardHeader>
            <CardTitle>{routeData?.partSummary?.id}</CardTitle>
            <CardDescription>{routeData?.partSummary?.name}</CardDescription>
          </CardHeader>
          <CardAction>
            {/* <Button
            variant="secondary"
            onClick={() => alert("TODO")}
            leftIcon={<FaHistory />}
          >
            View History
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
              <CardAttributeLabel>Replenishment</CardAttributeLabel>
              <CardAttributeValue>
                <Enumerable
                  value={routeData?.partSummary?.replenishmentSystem ?? null}
                />
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Part Type</CardAttributeLabel>
              <CardAttributeValue>
                <Enumerable value={routeData?.partSummary?.partType ?? null} />
              </CardAttributeValue>
            </CardAttribute>
            <CardAttribute>
              <CardAttributeLabel>Unit of Measure</CardAttributeLabel>
              <CardAttributeValue>
                {routeData?.partSummary?.unitOfMeasureCode}
              </CardAttributeValue>
            </CardAttribute>
          </CardAttributes>
        </CardContent>
      </Card>
    </VStack>
  );
};

export default PartHeader;
