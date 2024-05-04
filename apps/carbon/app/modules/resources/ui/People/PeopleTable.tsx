import {
  Checkbox,
  Enumerable,
  HStack,
  MenuIcon,
  MenuItem,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { Avatar, Hyperlink, New, Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { AttributeCategory, Person } from "~/modules/resources";
import { DataType } from "~/modules/shared";
import type { EmployeeType } from "~/modules/users";
import { path } from "~/utils/path";

type PeopleTableProps = {
  attributeCategories: AttributeCategory[];
  data: Person[];
  count: number;
  employeeTypes: Partial<EmployeeType>[];
};

const PeopleTable = memo(
  ({ attributeCategories, data, count, employeeTypes }: PeopleTableProps) => {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const [params] = useUrlParams();

    const employeeTypesById = useMemo(
      () =>
        employeeTypes.reduce<Record<string, Partial<EmployeeType>>>(
          (acc, type) => {
            if (type.id) acc[type.id] = type;
            return acc;
          },
          {}
        ),
      [employeeTypes]
    );

    const renderGenericAttribute = useCallback(
      (
        value?: string | number | boolean,
        dataType?: DataType,
        user?: {
          id: string;
          fullName: string | null;
          avatarUrl: string | null;
        } | null
      ) => {
        if (!value || !dataType) return null;

        if (dataType === DataType.Boolean) {
          return value === true ? "Yes" : "No";
        }

        if (dataType === DataType.Date) {
          return new Date(value as string).toLocaleDateString();
        }

        if (dataType === DataType.Numeric) {
          return Number(value).toLocaleString();
        }

        if (dataType === DataType.Text || dataType === DataType.List) {
          return value;
        }

        if (dataType === DataType.User) {
          if (!user) return null;
          return (
            <HStack>
              <Avatar
                size="sm"
                name={user.fullName ?? undefined}
                path={user.avatarUrl}
              />
              <p>{user.fullName ?? ""}</p>
            </HStack>
          );
        }

        return "Unknown";
      },
      []
    );

    const columns = useMemo<ColumnDef<(typeof data)[number]>[]>(() => {
      const defaultColumns: ColumnDef<(typeof data)[number]>[] = [
        {
          header: "User",
          cell: ({ row }) => (
            <HStack>
              <Avatar
                size="sm"
                name={row.original.name ?? undefined}
                path={row.original.avatarUrl ?? undefined}
              />

              <Hyperlink to={path.to.personDetails(row?.original.id!)}>
                {row.original.fullName}
              </Hyperlink>
            </HStack>
          ),
        },

        {
          accessorKey: "firstName",
          header: "First Name",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "lastName",
          header: "Last Name",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "email",
          header: "Email",
          cell: (item) => item.getValue(),
        },
        {
          id: "employeeTypeId",
          header: "Employee Type",
          cell: ({ row }) => (
            <Enumerable
              value={employeeTypesById[row.original.employeeTypeId].name}
            />
          ),
          meta: {
            filter: {
              type: "static",
              options: employeeTypes.map((type) => ({
                value: type.id!,
                label: <Enumerable value={type.name!} />,
              })),
            },
          },
        },
        {
          accessorKey: "active",
          header: "Active",
          cell: (item) => <Checkbox isChecked={item.getValue<boolean>()} />,
          meta: {
            filter: {
              type: "static",
              options: [
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ],
            },
          },
        },
      ];

      const additionalColumns: ColumnDef<(typeof data)[number]>[] = [];

      attributeCategories.forEach((category) => {
        if (category.userAttribute && Array.isArray(category.userAttribute)) {
          category.userAttribute.forEach((attribute) => {
            additionalColumns.push({
              id: attribute.id,
              header: attribute.name,
              cell: ({ row }) =>
                renderGenericAttribute(
                  row?.original?.attributes?.[attribute?.id]?.value,
                  row?.original?.attributes?.[attribute?.id]?.dataType,
                  row?.original?.attributes?.[attribute?.id]?.user
                ),
            });
          });
        }
      });

      return [...defaultColumns, ...additionalColumns];
    }, [
      attributeCategories,
      employeeTypes,
      employeeTypesById,
      renderGenericAttribute,
    ]);

    const renderContextMenu = useMemo(() => {
      return permissions.can("update", "resources")
        ? (row: (typeof data)[number]) => {
            return (
              <MenuItem
                onClick={() =>
                  navigate(
                    `${path.to.personDetails(
                      row.user?.id!
                    )}?${params.toString()}`
                  )
                }
              >
                <MenuIcon icon={<BsFillPenFill />} />
                Edit Employee
              </MenuItem>
            );
          }
        : undefined;
    }, [navigate, params, permissions]);

    return (
      <>
        <Table<(typeof data)[number]>
          // actions={actions}
          count={count}
          columns={columns}
          data={data}
          defaultColumnPinning={{
            left: ["Select", "User"],
          }}
          primaryAction={
            permissions.can("create", "users") && (
              <New
                label="Employee"
                to={`${path.to.newEmployee}?${params.toString()}`}
              />
            )
          }
          renderContextMenu={renderContextMenu}
          withColumnOrdering
        />
      </>
    );
  }
);

PeopleTable.displayName = "EmployeeTable";

export default PeopleTable;
