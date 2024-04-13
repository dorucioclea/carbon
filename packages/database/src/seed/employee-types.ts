import { v4 as uuidv4 } from "uuid";
import type { Feature } from "./features";

export const initialEmployeeTypes = ["Admin"] as const;

export type EmployeeType = (typeof initialEmployeeTypes)[number];

const employeeTypes = {} as Record<
  EmployeeType,
  { id: string; name: string; protected?: boolean }
>;

initialEmployeeTypes.forEach((type) => {
  employeeTypes[type] = {
    id: uuidv4(),
    name: type,
    protected: type === "Admin",
  };
});

export const ALL_TEAMS_ID = 0;

export { employeeTypes };
export const employeeTypePermissionsDefinitions: Record<
  EmployeeType,
  Record<
    Feature,
    { create: number[]; update: number[]; delete: number[]; view: number[] }
  >
> = {
  Admin: {
    Accounting: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    Invoicing: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    Parts: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    // Jobs: {
    //   create: [ALL_TEAMS_ID],
    //   update: [ALL_TEAMS_ID],
    //   delete: [ALL_TEAMS_ID],
    //   view: [ALL_TEAMS_ID],
    // },
    Inventory: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    // Scheduling: {
    //   create: [ALL_TEAMS_ID],
    //   update: [ALL_TEAMS_ID],
    //   delete: [ALL_TEAMS_ID],
    //   view: [ALL_TEAMS_ID],
    // },
    Sales: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    Purchasing: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    Documents: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    // Messaging: {
    //   create: [ALL_TEAMS_ID],
    //   update: [ALL_TEAMS_ID],
    //   delete: [ALL_TEAMS_ID],
    //   view: [ALL_TEAMS_ID],
    // },
    // Timecards: {
    //   create: [ALL_TEAMS_ID],
    //   update: [ALL_TEAMS_ID],
    //   delete: [ALL_TEAMS_ID],
    //   view: [ALL_TEAMS_ID],
    // },
    Resources: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    Users: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
    Settings: {
      create: [ALL_TEAMS_ID],
      update: [ALL_TEAMS_ID],
      delete: [ALL_TEAMS_ID],
      view: [ALL_TEAMS_ID],
    },
  },
};
