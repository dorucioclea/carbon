import { useRouteData } from "./useRouteData";

type User = {
  email: string;
  firstName: string;
  lastName: string;
};

export function useUser() {
  const data = useRouteData<{ user: unknown }>("/app");
  if (data?.user && isUser(data.user)) {
    return data.user;
  }
  // TODO: force logout -- the likely cause is development changes
  throw new Error(
    "useUser must be used within an authenticated route. If you are seeing this error, you are likely in development and have changed the session variables. Try deleting the cookies."
  );
}

function isUser(value: any): value is User {
  return (
    typeof value.email === "string" &&
    typeof value.firstName === "string" &&
    typeof value.lastName === "string"
  );
}