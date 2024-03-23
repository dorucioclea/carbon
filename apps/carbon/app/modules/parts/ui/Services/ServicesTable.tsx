import { Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { Hyperlink, New, Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import { serviceType, type Service } from "~/modules/parts";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

type ServicesTableProps = {
  data: Service[];
  count: number;
  partGroups: ListItem[];
};

const ServicesTable = memo(
  ({ data, count, partGroups }: ServicesTableProps) => {
    const navigate = useNavigate();
    const [params] = useUrlParams();
    const permissions = usePermissions();

    const customColumns = useCustomColumns<Service>("service");
    const columns = useMemo<ColumnDef<Service>[]>(() => {
      const defaultColumns: ColumnDef<Service>[] = [
        {
          accessorKey: "id",
          header: "Service ID",
          cell: ({ row }) => (
            <Hyperlink to={path.to.serviceDetails(row.original.id!)}>
              {row.original.id}
            </Hyperlink>
          ),
        },
        {
          accessorKey: "name",
          header: "Name",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "description",
          header: "Description",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "serviceType",
          header: "Type",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: serviceType.map((type) => ({
                value: type,
                label: <Enumerable value={type} />,
              })),
            },
          },
        },
        {
          // @ts-ignore
          accessorKey: "partGroup",
          header: "Part Group",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: partGroups.map(({ id, name }) => ({
                value: id,
                label: <Enumerable value={name} />,
              })),
            },
          },
        },
      ];
      return [...defaultColumns, ...customColumns];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, customColumns]);

    const renderContextMenu = useMemo(() => {
      // eslint-disable-next-line react/display-name
      return (row: Service) => (
        <MenuItem onClick={() => navigate(path.to.service(row.id!))}>
          <MenuIcon icon={<BsFillPenFill />} />
          Edit Service
        </MenuItem>
      );
    }, [navigate]);

    return (
      <>
        <Table<Service>
          count={count}
          columns={columns}
          data={data}
          primaryAction={
            permissions.can("create", "parts") && (
              <New label="Service" to={path.to.newService} />
            )
          }
          renderContextMenu={renderContextMenu}
        />
      </>
    );
  }
);

ServicesTable.displayName = "ServicesTable";

export default ServicesTable;
