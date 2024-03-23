import {
  Badge,
  BadgeCloseButton,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  Enumerable,
  HStack,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  MenuIcon,
  MenuItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
  useDisclosure,
} from "@carbon/react";
import { convertKbToString, filterEmpty } from "@carbon/utils";
import { useRevalidator } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { BsFillPenFill, BsPin, BsPinFill } from "react-icons/bs";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { RxCheck } from "react-icons/rx";
import { VscOpenPreview } from "react-icons/vsc";
import { Avatar, Hyperlink, Table } from "~/components";
import { Confirm, ConfirmDelete } from "~/components/Modals";
import { usePermissions, useUrlParams } from "~/hooks";
import type { Document, DocumentLabel } from "~/modules/documents";
import { DocumentIcon, documentTypes } from "~/modules/documents";
import { path } from "~/utils/path";
import DocumentCreateForm from "./DocumentCreateForm";
import { useDocument } from "./useDocument";

type DocumentsTableProps = {
  data: Document[];
  count: number;
  labels: DocumentLabel[];
  extensions: (string | null)[];
};

const DocumentsTable = memo(
  ({ data, count, labels, extensions }: DocumentsTableProps) => {
    const permissions = usePermissions();
    const revalidator = useRevalidator();
    const [params] = useUrlParams();
    const filter = params.get("q");
    // put rows in state for use with optimistic ui updates
    const [rows, setRows] = useState<Document[]>(data);
    // we have to do this useEffect silliness since we're putitng rows
    // in state for optimistic ui updates
    useEffect(() => {
      setRows(data);
    }, [data]);

    const {
      canUpdate,
      canDelete,
      deleteLabel,
      download,
      edit,
      favorite,
      label,
      setLabel,
    } = useDocument();

    const deleteDocumentModal = useDisclosure();

    const [selectedDocument, setSelectedDocument] = useState<Document | null>(
      null
    );

    const labelOptions = useMemo(
      () =>
        labels.map(({ label }) => ({
          value: label as string,
          label: label as string,
        })) ?? [],
      [labels]
    );

    const onDeleteLabel = useCallback(
      async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        row: Document,
        label: string
      ) => {
        e.stopPropagation();
        // optimistically update the UI and then make the mutation
        setRows((prev) => {
          const index = prev.findIndex((item) => item.id === row.id);
          const updated = [...prev];
          const labelIndex = updated[index].labels?.findIndex(
            (item) => item === label
          );
          if (labelIndex) {
            updated[index].labels?.splice(labelIndex, 1);
          }
          return updated;
        });
        // mutate the database
        await deleteLabel(row, label);
      },
      [deleteLabel]
    );

    const onLabel = useCallback(
      async (row: Document, labels: string[]) => {
        // optimistically update the UI and then make the mutation
        setRows((prev) => {
          const index = prev.findIndex((item) => item.id === row.id);
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            labels: labels.sort(),
          };
          return updated;
        });
        // mutate the database
        await label(row, labels);
      },
      [label]
    );

    // TODO: rows shouldn't be in state -- we should use optimistic updates like purchase order favorites
    const onFavorite = useCallback(
      async (row: Document) => {
        // optimistically update the UI and then make the mutation
        setRows((prev) => {
          const index = prev.findIndex((item) => item.id === row.id);
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            favorite: !updated[index].favorite,
          };
          return filter === "starred"
            ? updated.filter((item) => item.favorite === true)
            : updated;
        });
        // mutate the database
        await favorite(row);
      },
      [favorite, filter]
    );

    const columns = useMemo<ColumnDef<Document>[]>(() => {
      return [
        {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
            <HStack>
              {row.original.favorite ? (
                <BsPinFill
                  className="cursor-pointer w-4 h-4 text-yellow-400"
                  onClick={() => onFavorite(row.original)}
                />
              ) : (
                <BsPin
                  className="cursor-pointer w-4 h-4 text-muted-foreground"
                  onClick={() => onFavorite(row.original)}
                />
              )}
              <DocumentIcon type={row.original.type!} />
              <Hyperlink onClick={() => download(row.original)}>
                {row.original.type &&
                ["Image", "PDF"].includes(row.original.type) ? (
                  <HoverCard>
                    <HoverCardTrigger>{row.original.name}</HoverCardTrigger>
                    {row.original.type === "PDF" ? (
                      <HoverCardContent className="w-[425px] h-[550px] overflow-hidden p-0">
                        <iframe
                          seamless
                          title={row.original.path!}
                          width="425"
                          height="550"
                          src={path.to.file.previewFile(
                            `private/${row.original.path}`
                          )}
                        />
                      </HoverCardContent>
                    ) : (
                      <HoverCardContent className="w-[400px] h-[400px] overflow-hidden p-0">
                        <iframe
                          seamless
                          title={row.original.path!}
                          width="400"
                          height="400"
                          src={path.to.file.previewImage(
                            "private",
                            row.original.path!
                          )}
                        />
                      </HoverCardContent>
                    )}
                  </HoverCard>
                ) : (
                  <>{row.original.name}</>
                )}
              </Hyperlink>
            </HStack>
          ),
        },
        {
          id: "labels",
          header: "Labels",
          cell: ({ row }) => (
            <HStack spacing={1}>
              {row.original.labels?.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setLabel(label)}
                >
                  {label}
                  <BadgeCloseButton
                    onClick={(e) => onDeleteLabel(e, row.original, label)}
                  />
                </Badge>
              ))}
              <Popover>
                <PopoverTrigger>
                  <Badge variant="secondary" className="cursor-pointer px-1">
                    <IoMdAdd />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  {/* TODO: we should have a CreateableMultiSelect component for this */}

                  <CreatableCommand
                    options={labelOptions}
                    selected={row.original.labels ?? []}
                    onChange={(newValue) =>
                      onLabel(row.original, [
                        ...(row.original.labels ?? []),
                        newValue,
                      ])
                    }
                    onCreateOption={async (newValue) => {
                      await onLabel(row.original, [
                        ...(row.original.labels ?? []),
                        newValue,
                      ]);
                      revalidator.revalidate();
                    }}
                  />
                </PopoverContent>
              </Popover>
            </HStack>
          ),
          meta: {
            filter: {
              type: "static",
              options: labelOptions,
              isArray: true,
            },
          },
        },
        {
          accessorKey: "size",
          header: "Size",
          cell: ({ row }) => convertKbToString(row.original.size ?? 0),
        },
        {
          accessorKey: "type",
          header: "Type",
          cell: (item) => <Enumerable value={item.getValue<string>()} />,
          meta: {
            filter: {
              type: "static",
              options: documentTypes.map((type) => ({
                label: (
                  <HStack spacing={2}>
                    <DocumentIcon type={type} />
                    <span>{type}</span>
                  </HStack>
                ),
                value: type,
              })),
            },
          },
        },
        {
          accessorKey: "extension",
          header: "File Extension",
          cell: (item) => item.getValue(),
          meta: {
            filter: {
              type: "static",
              options: filterEmpty(extensions).map((extension) => ({
                label: extension,
                value: extension,
              })),
            },
          },
        },
        {
          accessorKey: "createdByFullName",
          header: "Created By",
          cell: ({ row }) => {
            return (
              <HStack>
                <Avatar
                  size="sm"
                  path={row.original.createdByAvatar ?? undefined}
                />
                <span>{row.original.createdByFullName}</span>
              </HStack>
            );
          },
        },

        {
          accessorKey: "createdAt",
          header: "Created At",
          cell: (item) => item.getValue(),
        },
        {
          accessorKey: "updatedByFullName",
          header: "Updated By",
          cell: ({ row }) => {
            return row.original.updatedByFullName ? (
              <HStack>
                <Avatar size="sm" path={row.original.updatedByAvatar ?? null} />
                <span>{row.original.updatedByFullName}</span>
              </HStack>
            ) : null;
          },
        },
        {
          accessorKey: "updatedAt",
          header: "Updated At",
          cell: (item) => item.getValue(),
        },
      ];
    }, [
      download,
      extensions,
      labelOptions,
      onDeleteLabel,
      onFavorite,
      onLabel,
      revalidator,
      setLabel,
    ]);

    const actions = useMemo(() => {
      return [
        // {
        //   label: "Add to Favorites",
        //   icon: <BsBookmark />,
        //   onClick: (selected: Document[]) => {
        //     console.log("move to favorites", selected);
        //   },
        // },
        // {
        //   label: "Add Labels",
        //   icon: <BsTag />,
        //   // TODO - disabled can be a function of selected
        //   disabled: true,
        //   onClick: (selected: Document[]) => {
        //     console.log("move to favorites", selected);
        //   },
        // },
        // {
        //   label: "Move to Trash",
        //   icon: <IoMdTrash />,
        //   // TODO - disabled can be a function of selected
        //   disabled: true,
        //   onClick: (selected: Document[]) => {
        //     console.log("move to trash", selected);
        //   },
        // },
        // {
        //   label: "Update Visibility",
        //   icon: <BsEyeFill />,
        //   // TODO - disabled can be a function of selected
        //   disabled: true,
        //   onClick: (selected: Document[]) => {
        //     console.log("update visibility", selected);
        //   },
        // },
      ];
    }, []);

    const defaultColumnVisibility = {
      type: false,
      extension: false,
      createdAt: false,
      updatedAt: false,
      updatedBy: false,
      description: false,
    };

    const renderContextMenu = useMemo(() => {
      // eslint-disable-next-line react/display-name
      return (row: Document) => (
        <>
          <MenuItem disabled={canUpdate(row)} onClick={() => edit(row)}>
            <MenuIcon icon={<BsFillPenFill />} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => download(row)}>
            <MenuIcon icon={<VscOpenPreview />} />
            Download
          </MenuItem>
          <MenuItem
            onClick={() => {
              onFavorite(row);
            }}
          >
            <MenuIcon icon={<BsPin />} />
            Favorite
          </MenuItem>
          <MenuItem
            disabled={canDelete(row)}
            onClick={() => {
              setSelectedDocument(row);
              deleteDocumentModal.onOpen();
            }}
          >
            <MenuIcon icon={<IoMdTrash />} />
            {filter !== "trash" ? "Move to Trash" : "Restore from Trash"}
          </MenuItem>
        </>
      );
    }, [
      canDelete,
      canUpdate,
      deleteDocumentModal,
      download,
      edit,
      filter,
      onFavorite,
    ]);

    return (
      <>
        <Table<Document>
          actions={actions}
          count={count}
          columns={columns}
          data={rows}
          defaultColumnVisibility={defaultColumnVisibility}
          primaryAction={
            permissions.can("create", "documents") && <DocumentCreateForm />
          }
          withColumnOrdering
          // withSelectableRows
          renderContextMenu={renderContextMenu}
        />

        {selectedDocument &&
          selectedDocument.id &&
          (filter !== "trash" ? (
            <ConfirmDelete
              action={path.to.deleteDocument(selectedDocument.id)}
              isOpen={deleteDocumentModal.isOpen}
              name={selectedDocument.name ?? ""}
              text={`Are you sure you want to move ${selectedDocument.name} to the trash?`}
              onCancel={() => {
                deleteDocumentModal.onClose();
                setSelectedDocument(null);
              }}
              onSubmit={() => {
                deleteDocumentModal.onClose();
                setSelectedDocument(null);
              }}
            />
          ) : (
            <Confirm
              action={path.to.documentRestore(selectedDocument.id)}
              isOpen={deleteDocumentModal.isOpen}
              name={`Restore ${selectedDocument.name}`}
              text={`Are you sure you want to restore ${selectedDocument.name} from the trash?`}
              onCancel={() => {
                deleteDocumentModal.onClose();
                setSelectedDocument(null);
              }}
              onSubmit={() => {
                deleteDocumentModal.onClose();
                setSelectedDocument(null);
              }}
            />
          ))}
      </>
    );
  }
);

type CreatableCommandProps = {
  options: {
    label: string;
    value: string;
  }[];
  selected: string[];
  onChange: (selected: string) => void;
  onCreateOption: (inputValue: string) => void;
};

const CreatableCommand = ({
  options,
  selected,
  onChange,
  onCreateOption,
}: CreatableCommandProps) => {
  const [search, setSearch] = useState("");
  const isExactMatch = options.some(
    (option) => option.value.toLowerCase() === search.toLowerCase()
  );

  return (
    <Command>
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search..."
        className="h-9"
      />
      <CommandGroup>
        {options.map((option) => {
          const isSelected = !!selected?.includes(option.value);
          return (
            <CommandItem
              value={option.label}
              key={option.value}
              onSelect={() => {
                if (!isSelected) onChange(option.value);
              }}
            >
              {option.label}
              <RxCheck
                className={cn(
                  "ml-auto h-4 w-4",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
            </CommandItem>
          );
        })}
        {!isExactMatch && !!search && (
          <CommandItem
            onSelect={() => {
              onCreateOption(search);
            }}
            value={search}
          >
            <span>Create</span>
            <span className="ml-1 font-bold">{search}</span>
          </CommandItem>
        )}
      </CommandGroup>
    </Command>
  );
};

DocumentsTable.displayName = "DocumentsTable";

export default DocumentsTable;
