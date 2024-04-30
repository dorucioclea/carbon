import { Button, ResizablePanel } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import { LuX } from "react-icons/lu";
import { path } from "~/utils/path";

type DocumentPreviewProps = {
  ownerId: string;
  bucket: string;
  pathToFile: string;
};

const DocumentView = ({
  ownerId,
  bucket,
  pathToFile,
}: DocumentPreviewProps) => {
  const navigate = useNavigate();
  // TODO: redirect to table
  const onClose = () => navigate(-1);

  return (
    <>
      <ResizablePanel>
        <Button isIcon variant={"ghost"} onClick={onClose}>
          <LuX className="w-4 h-4" />
        </Button>
        <iframe
          seamless
          title={pathToFile}
          width="100%"
          height="100%"
          src={path.to.file.previewFile(`${bucket}/${pathToFile}`)}
        />
      </ResizablePanel>
    </>
  );
};

export default DocumentView;
