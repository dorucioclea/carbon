import type { Database } from "@carbon/database";
import type {
  getCustomers,
  getEmployees,
  getEmployeeTypes,
  getFeatures,
  getPermissionsByEmployeeType,
  getSuppliers,
  getUsers,
} from "./users.service";

export type Customer = NonNullable<
  Awaited<ReturnType<typeof getCustomers>>["data"]
>[number];

export type Employee = NonNullable<
  Awaited<ReturnType<typeof getEmployees>>["data"]
>[number];

export type EmployeeRow = Database["public"]["Tables"]["employee"]["Row"];

export type EmployeeTypePermission = NonNullable<
  Awaited<ReturnType<typeof getPermissionsByEmployeeType>>["data"]
>[number];

export type EmployeeType = NonNullable<
  Awaited<ReturnType<typeof getEmployeeTypes>>["data"]
>[number];

export type Feature = NonNullable<
  Awaited<ReturnType<typeof getFeatures>>["data"]
>[number];

export type Group = {
  data: {
    id: string;
    companyId: number;
    isEmployeeTypeGroup: boolean;
    isCustomerOrgGroup: boolean;
    isCustomerTypeGroup: boolean;
    isSupplierOrgGroup: boolean;
    isSupplierTypeGroup: boolean;
    name: string;
    users: User[];
  };
  children: Group[];
};

export type Permission = {
  view: number[];
  create: number[];
  update: number[];
  delete: number[];
};

export type Supplier = NonNullable<
  Awaited<ReturnType<typeof getSuppliers>>["data"]
>[number];

export type User = NonNullable<
  Awaited<ReturnType<typeof getUsers>>["data"]
>[number];
