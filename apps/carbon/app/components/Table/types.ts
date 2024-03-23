import "@tanstack/react-table";
import type { ColumnFilterData } from "./components/Filter/types";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    filter?: ColumnFilterData;
    pluralHeader?: string;
  }
}
export interface TableAction<T> {
  label: string;
  onClick: (rows: T[]) => void;
  disabled?: boolean;
  icon?: JSX.Element;
}
