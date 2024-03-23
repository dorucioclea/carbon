import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from "@carbon/react";
import { Link } from "@remix-run/react";
import { MdAdd } from "react-icons/md";
import useCreate from "./useCreate";

const CreateMenu = () => {
  const createLinks = useCreate();

  if (!createLinks.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          aria-label="Create"
          icon={<MdAdd />}
          variant="secondary"
          className={"!border-dashed border-border"}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {createLinks.map((link) => (
          <DropdownMenuItem key={link.to} asChild>
            <Link to={link.to}>
              {link.icon && <DropdownMenuIcon icon={link.icon} />}
              {link.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateMenu;
