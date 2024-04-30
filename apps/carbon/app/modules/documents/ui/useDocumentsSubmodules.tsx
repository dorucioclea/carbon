import { Clock, Folder, FolderHeart, Pin, Trash } from "lucide-react";
import type { Route } from "~/types";
import { path } from "~/utils/path";

const documentsRoutes: Route[] = [
  {
    name: "All Documents",
    to: path.to.documents,
    icon: <Folder />,
  },
  {
    name: "My Documents",
    to: path.to.documents,
    q: "my",
    icon: <FolderHeart />,
  },
  {
    name: "Recent",
    to: path.to.documents,
    q: "recent",
    icon: <Clock />,
  },
  {
    name: "Pinned",
    to: path.to.documents,
    q: "starred",
    icon: <Pin />,
  },
  {
    name: "Trash",
    to: path.to.documents,
    q: "trash",
    icon: <Trash />,
  },
];

export default function useDocumentsSubmodules() {
  return { links: documentsRoutes };
}
