import { Enumerable, Hyperlink, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { Table } from "~/components";
import { useUrlParams } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { Service } from "~/modules/parts";
import { path } from "~/utils/path";

type ServicesTableProps = {
  data: Service[];
  count: number;
};

const ServicesTable = memo(({ data, count }: ServicesTableProps) => {
  const navigate = useNavigate();
  const [params] = useUrlParams();

  const customColumns = useCustomColumns<Service>("service");
  const columns = useMemo<ColumnDef<Service>[]>(() => {
    const defaultColumns: ColumnDef<Service>[] = [
      {
        accessorKey: "id",
        header: "Service ID",
        cell: ({ row }) => (
          <Hyperlink
            onClick={() => navigate(path.to.service(row.original.id!))}
          >
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
      },
      {
        // @ts-ignore
        accessorKey: "partGroup",
        header: "Part Group",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
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
        withPagination
        renderContextMenu={renderContextMenu}
      />
    </>
  );
});

ServicesTable.displayName = "ServicesTable";

export default ServicesTable;
