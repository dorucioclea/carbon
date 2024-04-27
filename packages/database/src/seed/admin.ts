import { modules } from "./modules";

const admin = {
  email: "admin@carbon.us.org",
  password: "carbon",
  firstName: "Carbon",
  lastName: "Admin",
};

const ALL_TEAMS_ID = 0;

const claims: Record<string, string | number[]> = {
  role: "employee",
};

modules.forEach((name) => {
  const moduleName = name.toLowerCase();
  claims[`${moduleName}_view`] = [ALL_TEAMS_ID];
  claims[`${moduleName}_create`] = [ALL_TEAMS_ID];
  claims[`${moduleName}_update`] = [ALL_TEAMS_ID];
  claims[`${moduleName}_delete`] = [ALL_TEAMS_ID];
});

export { admin, claims };
