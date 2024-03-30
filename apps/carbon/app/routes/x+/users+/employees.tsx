import { VStack } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  EmployeesTable,
  getEmployeeTypes,
  getEmployees,
} from "~/modules/users";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";
import { getGenericQueryFilters } from "~/utils/query";
import { error } from "~/utils/result";

export const handle: Handle = {
  breadcrumb: "Employees",
  to: path.to.employeeAccounts,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "users",
    role: "employee",
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const search = searchParams.get("search");

  const { limit, offset, sorts, filters } =
    getGenericQueryFilters(searchParams);

  const [employees, employeeTypes] = await Promise.all([
    getEmployees(client, { search, limit, offset, sorts, filters }),
    getEmployeeTypes(client),
  ]);

  if (employees.error) {
    throw redirect(
      path.to.users,
      await flash(request, error(employees.error, "Error loading employees"))
    );
  }
  if (employeeTypes.error) {
    throw redirect(
      path.to.users,
      await flash(
        request,
        error(employeeTypes.error, "Error loading employee types")
      )
    );
  }

  return json({
    count: employees.count ?? 0,
    employees: employees.data,
    employeeTypes: employeeTypes.data,
  });
}

export default function UsersEmployeesRoute() {
  const { count, employees, employeeTypes } = useLoaderData<typeof loader>();

  return (
    <VStack spacing={0} className="h-full">
      <EmployeesTable
        data={employees}
        count={count}
        employeeTypes={employeeTypes}
      />
      <Outlet />
    </VStack>
  );
}
