import { ALL_TEAMS_ID } from "./employee-types";
import { possibleFeatures } from "./features";

const admin = {
  email: "admin@carbon.us.org",
  password: "carbon",
  firstName: "Carbon",
  lastName: "Admin",
};

const claims: Record<string, string | number[]> = {
  role: "employee",
};

possibleFeatures.forEach((name) => {
  const moduleName = name.toLowerCase();
  claims[`${moduleName}_view`] = [ALL_TEAMS_ID];
  claims[`${moduleName}_create`] = [ALL_TEAMS_ID];
  claims[`${moduleName}_update`] = [ALL_TEAMS_ID];
  claims[`${moduleName}_delete`] = [ALL_TEAMS_ID];
});

export { admin, claims };
