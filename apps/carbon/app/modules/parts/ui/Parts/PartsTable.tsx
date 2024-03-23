import { Enumerable, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { Hyperlink, New, Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import { useCustomColumns } from "~/hooks/useCustomColumns";
import type { Part } from "~/modules/parts";
import { partReplenishmentSystems, partTypes } from "~/modules/parts";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

type PartsTableProps = {
  data: Part[];
  partGroups: ListItem[];
  count: number;
};

const PartsTable = memo(({ data, count, partGroups }: PartsTableProps) => {
  const navigate = useNavigate();
  const [params] = useUrlParams();
  const permissions = usePermissions();
  const customColumns = useCustomColumns<Part>("part");

  const columns = useMemo<ColumnDef<Part>[]>(() => {
    const defaultColumns: ColumnDef<Part>[] = [
      {
        accessorKey: "id",
        header: "Part ID",
        cell: ({ row }) => (
          <Hyperlink to={path.to.partDetails(row.original.id!)}>
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
        accessorKey: "partType",
        header: "Part Type",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
        meta: {
          filter: {
            type: "static",
            options: partTypes.map((type) => ({
              value: type,
              label: <Enumerable value={type} />,
            })),
          },
        },
      },
      {
        accessorKey: "replenishmentSystem",
        header: "Replenishment",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
        meta: {
          filter: {
            type: "static",
            options: partReplenishmentSystems.map((type) => ({
              value: type,
              label: <Enumerable value={type} />,
            })),
          },
        },
      },
      {
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
  }, [params]);

  const renderContextMenu = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return (row: Part) => (
      <MenuItem onClick={() => navigate(path.to.part(row.id!))}>
        <MenuIcon icon={<BsFillPenFill />} />
        Edit Part
      </MenuItem>
    );
  }, [navigate]);

  return (
    <>
      <Table<Part>
        count={count}
        columns={columns}
        data={data}
        primaryAction={
          permissions.can("create", "parts") && (
            <New label="Part" to={path.to.newPart} />
          )
        }
        renderContextMenu={renderContextMenu}
      />
    </>
  );
});

PartsTable.displayName = "PartTable";

export default PartsTable;
