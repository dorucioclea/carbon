import {
  Button,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  VStack,
} from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import type { PostgrestResponse } from "@supabase/supabase-js";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { LuListFilter } from "react-icons/lu";
import { MdClose } from "react-icons/md";
import type { ColumnFilter, Option } from "./types";
import { useFilters } from "./useFilters";

export type FilterProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onChange"
> & {
  filters: ColumnFilter[];
  trigger?: "button" | "icon";
};

const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  ({ filters, trigger = "button", ...props }, ref) => {
    const { clearFilters, hasFilter, hasFilters, hasFilterKey, toggleFilter } =
      useFilters();

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<ColumnFilter | null>(null);
    const [activeOptions, setActiveOptions] = useState<Option[]>([]);

    // reset the state when the filter
    useEffect(() => {
      if (!open) {
        setInput("");
        setActiveOptions([]);
        setActiveFilter(null);
      }
    }, [open]);

    const fetcher =
      useFetcher<PostgrestResponse<{ id: string; name: string }>>();

    useEffect(() => {
      if (
        activeFilter?.filter.type === "fetcher" &&
        fetcher.data !== null &&
        typeof fetcher.data === "object" &&
        "data" in fetcher.data
      ) {
        setActiveOptions(
          activeFilter.filter.transform
            ? activeFilter.filter.transform(fetcher.data.data)
            : fetcher.data.data?.map((d) => ({ label: d.name, value: d.id })) ??
                []
        );

        setLoading(false);
      }
    }, [fetcher.data, activeFilter]);

    const columnFilters = useMemo(
      () => filters.map((f) => ({ value: f.accessorKey, label: f.header })),
      [filters]
    );

    const updateActiveOptions = useCallback(
      (value: string) => {
        const accessorKey = value.split(":")?.[1] ?? "";

        const filter = filters.find(
          (f) => f.accessorKey.toLowerCase() === accessorKey.toLowerCase()
        );

        if (!filter)
          throw new Error(`Filter not found for accessorKey: ${accessorKey}`);

        setInput("");
        setActiveFilter(filter ?? null);

        if (filter?.filter.type === "static") {
          setActiveOptions(filter.filter.options);
        } else if (filter?.filter.type === "fetcher") {
          setLoading(true);
          fetcher.load(filter.filter.endpoint);
        }
      },
      [fetcher, filters]
    );

    return hasFilters && !open && trigger !== "icon" ? (
      <HStack>
        <Button
          rightIcon={<MdClose />}
          ref={ref}
          variant="secondary"
          onClick={clearFilters}
          className={"!border-dashed border-border"}
          {...props}
        >
          Clear Filters
        </Button>
      </HStack>
    ) : (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {trigger === "icon" ? (
            <Button
              aria-label="Remove filter"
              className="px-1 w-6"
              variant="secondary"
              size="sm"
              onClick={() => {
                setOpen(true);
              }}
            >
              <IoMdAdd />
            </Button>
          ) : (
            <Button
              rightIcon={<LuListFilter />}
              role="combobox"
              ref={ref}
              variant="secondary"
              onClick={() => {
                setOpen(true);
              }}
              className={"!border-dashed border-border"}
              {...props}
            >
              Filter
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="min-w-[200px] w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              value={input}
              onValueChange={setInput}
              placeholder="Search..."
              className="h-9"
            />
            <CommandEmpty>
              {loading ? "Loading..." : "No available filters."}
            </CommandEmpty>
            {activeFilter === null ? (
              <CommandGroup>
                {columnFilters
                  .filter((column) => !hasFilterKey(column.value))
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      value={`${option.label}:${option.value}`}
                      onSelect={updateActiveOptions}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ) : (
              <CommandGroup>
                {activeOptions.map((option) => {
                  const isChecked = hasFilter(
                    activeFilter.accessorKey,
                    option.value
                  );
                  return (
                    <CommandItem
                      value={option.value}
                      key={option.value}
                      onSelect={() => {
                        toggleFilter(
                          activeFilter.accessorKey,
                          option.value,
                          activeFilter.filter.isArray
                        );
                        if (trigger === "icon") {
                          setOpen(false);
                        } else {
                          setInput("");
                        }
                      }}
                    >
                      <HStack spacing={2}>
                        <Checkbox id={option.value} isChecked={isChecked} />
                        <label htmlFor={option.value}>
                          <VStack spacing={0}>
                            <span>{option.label}</span>
                            {option.helperText && (
                              <p className="text-xs text-muted-foreground truncate">
                                {option.helperText}
                              </p>
                            )}
                          </VStack>
                        </label>
                      </HStack>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
Filter.displayName = "Filter";

export default Filter;
