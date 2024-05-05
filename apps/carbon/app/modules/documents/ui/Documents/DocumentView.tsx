import {
  Button,
  ResizableHandle,
  ResizablePanel,
  Skeleton,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { LuX } from "react-icons/lu";
import { Document, Page, pdfjs } from "react-pdf";
import { path } from "~/utils/path";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function SkeletonDocument() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[780px] bg-background w-[680px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 bg-background w-[680px]" />
        <Skeleton className="h-4 bg-background w-[680px]" />
      </div>
    </div>
  );
}

type DocumentPreviewProps = {
  bucket: string;
  pathToFile: string;
  type: string;
  name: string;
};

const DocumentView = ({
  bucket,
  pathToFile,
  type,
  name,
}: DocumentPreviewProps) => {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const navigate = useNavigate();
  const onClose = () => navigate(path.to.documents);

  if (type?.startsWith("Image")) {
    return (
      <>
        <ResizableHandle withHandle />
        <ResizablePanel maxSize={50} minSize={25}>
          <Button isIcon variant={"ghost"} onClick={onClose}>
            <LuX className="w-4 h-4" />
          </Button>
          <div className="border w-full mx-auto rounded-md">
            <img
              src={path.to.file.previewFile(`${bucket}/${pathToFile}`)}
              className="object-contain"
              width={"680"}
              alt="Preview"
            />
          </div>
        </ResizablePanel>
      </>
    );
  }

  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel maxSize={75} minSize={25}>
        <Button isIcon variant={"ghost"} onClick={onClose}>
          <LuX className="w-4 h-4" />
        </Button>
        <Document
          file={path.to.file.previewFile(`${bucket}/${pathToFile}`)}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<SkeletonDocument />}
        >
          <div className="overflow-auto" style={{ height: "780px" }}>
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                width={680}
                height={780}
              />
            ))}
          </div>
        </Document>
      </ResizablePanel>
    </>
  );
};

export default DocumentView;
