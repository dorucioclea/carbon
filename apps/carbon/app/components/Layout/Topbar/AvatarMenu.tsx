import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@carbon/react";
import { Form, Link } from "@remix-run/react";
import { LuLogOut, LuUserCircle } from "react-icons/lu";
import { Avatar } from "~/components";
import { useUser } from "~/hooks";
import { path } from "~/utils/path";

const AvatarMenu = () => {
  const user = useUser();
  const name = `${user.firstName} ${user.lastName}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus-visible:outline-none">
        <Avatar path={user.avatarUrl} name={name} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Signed in as {name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={path.to.profile}>
            <DropdownMenuIcon icon={<LuUserCircle />} />
            My Profile
          </Link>
        </DropdownMenuItem>
        <Form method="post" action={path.to.logout}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <DropdownMenuIcon icon={<LuLogOut />} />
              <span>Sign Out</span>
            </button>
          </DropdownMenuItem>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarMenu;
