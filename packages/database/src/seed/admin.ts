const admin = {
  email: "admin@carbon.us.org",
  password: "carbon",
  firstName: "Carbon",
  lastName: "Admin",
};

const ALL_TEAMS_ID = 0;

const claims: Record<string, string | number[]> = {
  role: "employee",
  settings_update: [ALL_TEAMS_ID],
  users_update: [ALL_TEAMS_ID],
};

export { admin, claims };
