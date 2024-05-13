import {
  Checkbox,
  Enumerable,
  HStack,
  MenuIcon,
  MenuItem,
  useDisclosure,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import { BsEnvelope, BsShieldLock } from "react-icons/bs";
import { FaBan } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { Avatar, Hyperlink, New, Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { Employee } from "~/modules/users";
import {
  BulkEditPermissionsForm,
  DeactivateUsersModal,
  ResendInviteModal,
} from "~/modules/users";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

type EmployeesTableProps = {
  data: Employee[];
  count: number;
  employeeTypes: ListItem[];
};

const defaultColumnVisibility = {
  user_firstName: false,
  user_lastName: false,
};

const EmployeesTable = memo(
  ({ data, count, employeeTypes }: EmployeesTableProps) => {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const [params] = useUrlParams();

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const bulkEditDrawer = useDisclosure();
    const deactivateEmployeeModal = useDisclosure();
    const resendInviteModal = useDisclosure();

    const canEdit = permissions.can("update", "users");

    const rows = useMemo(
      () =>
        data.map((d) => {
          // we should have one user and employee per employee id
          if (
            d.user === null ||
            d.employeeType === null ||
            Array.isArray(d.user) ||
            Array.isArray(d.employeeType)
          ) {
            throw new Error("Expected user and employee type to be objects");
          }

          return d;
        }),
      [data]
    );

    const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(() => {
      return [
        {
          header: "User",
          cell: ({ row }) => (
            <HStack>
              <Avatar
                size="sm"
                name={row.original.user?.fullName ?? undefined}
                path={row.original.user?.avatarUrl ?? undefined}
              />

              <Hyperlink
                to={`${path.to.employeeAccount(
                  row.original.user?.id!
                )}?${params.toString()}`}
              >
                {`${row.original.user?.firstName} ${row.original.user?.lastName}`}
              </Hyperlink>
            </HStack>
          ),
        },

        {
          accessorKey: "user.firstName",
          header: "First Name",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "user.lastName",
          header: "Last Name",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "user.email",
          header: "Email",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "employeeType.name",
          header: "Employee Type",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: employeeTypes.map((type) => ({
                value: type.name,
                label: <Enumerable value={type.name} />,
              })),
            },
          },
        },
        {
          accessorKey: "user.active",
          header: "Active",
          cell: (item) => <Checkbox isChecked={item.getValue<boolean>()} />,
          meta: {
            filter: {
              type: "static",
              options: [
                {
                  value: "true",
                  label: "Active",
                },
                {
                  value: "false",
                  label: "Inactive",
                },
              ],
            },
          },
        },
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const actions = useMemo(() => {
      return [
        {
          label: "Edit Permissions",
          icon: <BsShieldLock />,
          disabled: !permissions.can("update", "users"),
          onClick: (selected: typeof rows) => {
            setSelectedUserIds(
              selected.reduce<string[]>((acc, row) => {
                if (row.user && !Array.isArray(row.user)) {
                  acc.push(row.user.id);
                }
                return acc;
              }, [])
            );
            bulkEditDrawer.onOpen();
          },
        },
        {
          label: "Send Account Invite",
          icon: <BsEnvelope />,
          disabled: !permissions.can("create", "users"),
          onClick: (selected: typeof rows) => {
            setSelectedUserIds(
              selected.reduce<string[]>((acc, row) => {
                if (row.user && !Array.isArray(row.user)) {
                  acc.push(row.user.id);
                }
                return acc;
              }, [])
            );
            resendInviteModal.onOpen();
          },
        },
        {
          label: "Deactivate Users",
          icon: <FaBan />,
          disabled: !permissions.can("delete", "users"),
          onClick: (selected: typeof rows) => {
            setSelectedUserIds(
              selected.reduce<string[]>((acc, row) => {
                if (row.user && !Array.isArray(row.user)) {
                  acc.push(row.user.id);
                }
                return acc;
              }, [])
            );
            deactivateEmployeeModal.onOpen();
          },
        },
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderContextMenu = useCallback(
      ({ user }: (typeof rows)[number]) => {
        if (Array.isArray(user) || user === null) return null;
        return (
          <>
            <MenuItem
              onClick={() =>
                navigate(
                  `${path.to.employeeAccount(user.id)}?${params.toString()}`
                )
              }
            >
              <MenuIcon icon={<LuPencil />} />
              Edit Employee
            </MenuItem>
            <MenuItem
              onClick={() => {
                setSelectedUserIds([user.id]);
                resendInviteModal.onOpen();
              }}
            >
              <MenuIcon icon={<BsEnvelope />} />
              Send Account Invite
            </MenuItem>
            {user.active === true && (
              <MenuItem
                onClick={(e) => {
                  setSelectedUserIds([user.id]);
                  deactivateEmployeeModal.onOpen();
                }}
              >
                <MenuIcon icon={<FaBan />} />
                Deactivate Employee
              </MenuItem>
            )}
          </>
        );
      },
      [deactivateEmployeeModal, navigate, params, resendInviteModal]
    );

    return (
      <>
        <Table<(typeof rows)[number]>
          actions={actions}
          count={count}
          columns={columns}
          data={rows}
          defaultColumnVisibility={defaultColumnVisibility}
          primaryAction={
            permissions.can("create", "users") && (
              <New label="Employee" to={`new?${params.toString()}`} />
            )
          }
          renderContextMenu={renderContextMenu}
          withColumnOrdering
          withSelectableRows={canEdit}
        />
        {bulkEditDrawer.isOpen && (
          <BulkEditPermissionsForm
            userIds={selectedUserIds}
            isOpen={bulkEditDrawer.isOpen}
            onClose={bulkEditDrawer.onClose}
          />
        )}
        {deactivateEmployeeModal.isOpen && (
          <DeactivateUsersModal
            userIds={selectedUserIds}
            isOpen={deactivateEmployeeModal.isOpen}
            onClose={deactivateEmployeeModal.onClose}
          />
        )}
        {resendInviteModal.isOpen && (
          <ResendInviteModal
            userIds={selectedUserIds}
            isOpen={resendInviteModal.isOpen}
            onClose={resendInviteModal.onClose}
          />
        )}
      </>
    );
  }
);

EmployeesTable.displayName = "EmployeeTable";

export default EmployeesTable;
