import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HStack,
  IconButton,
  VStack,
  cn,
} from "@carbon/react";

import { ValidatedForm } from "@carbon/remix-validated-form";
import { useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { BsDownload, BsThreeDotsVertical, BsUpload } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import type { z } from "zod";
import {
  CustomFormFields,
  Hidden,
  Input,
  InputControlled,
  Part,
  Select,
  SelectControlled,
  Submit,
} from "~/components/Form";
import { usePermissions, useRouteData } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import type { Quotation } from "~/modules/sales";
import { quotationLineValidator, quoteLineStatusType } from "~/modules/sales";
import { path } from "~/utils/path";

type QuotationLineFormProps = {
  initialValues: z.infer<typeof quotationLineValidator>;
};

const QuotationLineForm = ({ initialValues }: QuotationLineFormProps) => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { supabase } = useSupabase();

  const { id } = useParams();

  if (!id) throw new Error("id not found");

  const routeData = useRouteData<{
    quotation: Quotation;
  }>(path.to.quote(id));

  const isEditable = ["Draft", "To Review"].includes(
    routeData?.quotation?.status ?? ""
  );

  const isEditing = initialValues.id !== undefined;
  const isDisabled = !isEditable
    ? true
    : isEditing
    ? !permissions.can("update", "sales")
    : !permissions.can("create", "sales");

  const [partData, setPartData] = useState<{
    partId: string;
    description: string;
    replenishmentSystem: string;
    uom: string;
  }>({
    partId: initialValues.partId ?? "",
    description: initialValues.description ?? "",
    replenishmentSystem: initialValues.replenishmentSystem ?? "",
    uom: initialValues.unitOfMeasureCode ?? "",
  });

  const onPartChange = async (partId: string) => {
    if (!supabase) return;
    const [part] = await Promise.all([
      supabase
        .from("part")
        .select("name, replenishmentSystem, unitOfMeasureCode")
        .eq("id", partId)
        .single(),
    ]);

    setPartData({
      partId,
      description: part.data?.name ?? "",
      replenishmentSystem:
        part.data?.replenishmentSystem === "Buy and Make"
          ? ""
          : part.data?.replenishmentSystem ?? "",
      uom: part.data?.unitOfMeasureCode ?? "",
    });
  };

  return (
    <ValidatedForm
      defaultValues={initialValues}
      validator={quotationLineValidator}
      method="post"
      action={
        isEditing
          ? path.to.quoteLine(id, initialValues.id!)
          : path.to.newQuoteLine(id)
      }
      className="w-full"
    >
      <Card>
        <HStack className="w-full justify-between items-start">
          <CardHeader>
            <CardTitle>{isEditing ? "Quote Line" : "New Quote Line"}</CardTitle>
            <CardDescription>
              {isEditing
                ? partData?.description
                : "A quote line contains pricing and lead times for a particular part"}
            </CardDescription>
          </CardHeader>
          <CardAction>
            {isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    icon={<BsThreeDotsVertical />}
                    aria-label="More"
                    variant="secondary"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("delete")}>
                    <DropdownMenuIcon icon={<IoMdTrash />} />
                    Delete Line
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <DropdownMenuIcon icon={<BsDownload />} />
                    Get Part
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <DropdownMenuIcon icon={<BsUpload />} />
                    Save Part
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardAction>
        </HStack>
        <CardContent>
          <Hidden name="intent" value="line" />
          <Hidden name="id" />
          <Hidden name="quoteId" />
          <Hidden name="unitOfMeasureCode" value={partData?.uom} />
          <VStack>
            <div className="grid w-full gap-x-8 gap-y-2 grid-cols-1 lg:grid-cols-3">
              <Part
                name="partId"
                label="Part"
                onChange={(value) => {
                  onPartChange(value?.value as string);
                }}
              />

              <InputControlled
                name="description"
                label="Description"
                value={partData.description}
                onChange={(newValue) =>
                  setPartData((d) => ({ ...d, description: newValue }))
                }
              />

              <SelectControlled
                name="replenishmentSystem"
                label="Replenishment System"
                options={
                  partData.replenishmentSystem === "Buy"
                    ? [{ label: "Buy", value: "Buy" }]
                    : partData.replenishmentSystem === "Make"
                    ? [{ label: "Make", value: "Make" }]
                    : [
                        {
                          label: "Buy",
                          value: "Buy",
                        },
                        {
                          label: "Make",
                          value: "Make",
                        },
                      ]
                }
                value={partData.replenishmentSystem}
                onChange={(newValue) => {
                  if (newValue)
                    setPartData((d) => ({
                      ...d,
                      replenishmentSystem: newValue?.value,
                    }));
                }}
              />

              <Input name="customerPartId" label="Customer Part ID" />
              <Input
                name="customerPartRevision"
                label="Customer Part Revision"
              />

              <Select
                name="status"
                label="Line Status"
                options={quoteLineStatusType.map((s) => ({
                  label: s,
                  value: s,
                }))}
                className={cn(!isEditing && "sr-only")}
              />

              <CustomFormFields table="quoteLine" />
            </div>
          </VStack>
        </CardContent>
        <CardFooter>
          <Submit isDisabled={isDisabled}>Save</Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default QuotationLineForm;
