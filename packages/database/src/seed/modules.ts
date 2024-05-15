const modules = [
  "Accounting",
  "Documents",
  "Inventory",
  "Invoicing",
  "Jobs",
  "Messaging",
  "Parts",
  "Purchasing",
  "Resources",
  "Sales",
  "Scheduling",
  "Settings",
  "Timecards",
  "Users",
] as const;

export type Module = (typeof modules)[number];

export { modules };
