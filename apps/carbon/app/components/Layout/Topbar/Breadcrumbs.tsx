import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  VStack,
  cn,
  useDisclosure,
  useWindowSize,
} from "@carbon/react";
import { ValidatedForm } from "@carbon/remix-validated-form";
import { Link, useMatches } from "@remix-run/react";
import { BsFillHexagonFill } from "react-icons/bs";
import { LuChevronsUpDown } from "react-icons/lu";
import { MdAdd } from "react-icons/md";
import { z } from "zod";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumbs as BreadcrumbsBase,
} from "~/components";
import { Input, Submit } from "~/components/Form";
import { usePermissions, useRouteData } from "~/hooks";
import { companyValidator, type Company } from "~/modules/settings";
import { path } from "~/utils/path";

export const BreadcrumbHandle = z.object({
  breadcrumb: z.any(),
  to: z.string().optional(),
});
export type BreadcrumbHandleType = z.infer<typeof BreadcrumbHandle>;

const BreadcrumbHandleMatch = z.object({
  handle: BreadcrumbHandle,
});

const Breadcrumbs = () => {
  const matches = useMatches();

  const breadcrumbs = matches
    .map((m) => {
      const result = BreadcrumbHandleMatch.safeParse(m);
      if (!result.success || !result.data.handle.breadcrumb) return null;

      return {
        breadcrumb: result.data.handle.breadcrumb,
        to: result.data.handle?.to ?? m.pathname,
      };
    })
    .filter(Boolean);

  const { width } = useWindowSize();

  return (
    <HStack className="items-center h-full -ml-2" spacing={0}>
      <BreadcrumbsBase className="line-clamp-1">
        {width && width <= 640 ? (
          <BreadcrumbItem>
            <Button isIcon asChild variant="ghost">
              <Link to="/">
                <BsFillHexagonFill />
              </Link>
            </Button>
          </BreadcrumbItem>
        ) : (
          <CompanyBreadcrumb />
        )}
        {breadcrumbs.map((breadcrumb, i) => (
          <BreadcrumbItem key={i}>
            <BreadcrumbLink
              isCurrentPage={!breadcrumb?.to}
              to={breadcrumb?.to ?? ""}
            >
              {breadcrumb?.breadcrumb}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </BreadcrumbsBase>
    </HStack>
  );
};

function CompanyBreadcrumb() {
  const routeData = useRouteData<{ company: Company; companies: Company[] }>(
    path.to.authenticatedRoot
  );

  const canCreateCompany = usePermissions().can("update", "settings");
  const hasMultipleCompanies = Boolean(
    routeData?.companies && routeData?.companies.length > 1
  );
  const hasCompanyMenu = canCreateCompany || hasMultipleCompanies;
  const companyForm = useDisclosure();

  return (
    <BreadcrumbItem isFirstChild>
      {hasCompanyMenu ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-current="page"
                variant="ghost"
                className="px-2"
                rightIcon={<LuChevronsUpDown />}
              >
                {routeData?.company.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[240px]">
              <DropdownMenuLabel>Companies</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {routeData?.companies.map((c) => (
                  <DropdownMenuItem
                    key={c.companyId}
                    className={cn(
                      "flex items-center justify-between",
                      c.id == routeData.company.id &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    <HStack>
                      <Avatar
                        size="xs"
                        name={c.name ?? undefined}
                        src={c.logo ?? undefined}
                      />
                      <span>{c.name}</span>
                    </HStack>
                    <Badge variant="secondary" className="ml-2">
                      {c.employeeType}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              {canCreateCompany && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={companyForm.onOpen}>
                      <DropdownMenuIcon icon={<MdAdd />} />
                      Add Company
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Modal
            open={companyForm.isOpen}
            onOpenChange={(open) => {
              if (!open) companyForm.onClose();
            }}
          >
            <ModalContent>
              <ValidatedForm validator={companyValidator} method="post">
                <ModalHeader>
                  <ModalTitle>Let's setup your new company</ModalTitle>
                  <ModalDescription>
                    You can always change this later
                  </ModalDescription>
                </ModalHeader>
                <ModalBody>
                  <VStack spacing={4}>
                    <Input autoFocus name="name" label="Company Name" />
                    <Input name="addressLine1" label="Address" />
                    <Input name="city" label="City" />
                    <Input name="state" label="State" />
                    <Input name="postalCode" label="Zip Code" />
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <Submit>Save</Submit>
                  </HStack>
                </ModalFooter>
              </ValidatedForm>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <BreadcrumbLink to="/">{routeData?.company.name}</BreadcrumbLink>
      )}
    </BreadcrumbItem>
  );
}

export default Breadcrumbs;
