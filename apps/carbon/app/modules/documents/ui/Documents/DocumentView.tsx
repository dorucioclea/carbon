import {
  Button,
  ResizableHandle,
  ResizablePanel,
  Skeleton,
} from "@carbon/react";
import { convertKbToString } from "@carbon/utils";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { LuDownload, LuX } from "react-icons/lu";
import { Document, Page, pdfjs } from "react-pdf";
import {
  DocumentIcon,
  type Document as DocumentType,
} from "~/modules/documents";
import { path } from "~/utils/path";
import { useDocument } from "./useDocument";

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
  type: string;
  document: DocumentType;
};

const DocumentView = ({ bucket, document }: DocumentPreviewProps) => {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const navigate = useNavigate();
  const onClose = () => navigate(path.to.documents);
  const { download } = useDocument();

  if (document.type?.startsWith("Image")) {
    return (
      <>
        <ResizableHandle withHandle />
        <ResizablePanel maxSize={50} minSize={25}>
          <div className="flex items-center justify-between">
            <Button isIcon variant={"ghost"} onClick={onClose}>
              <LuX className="w-4 h-4" />
            </Button>
            <span>{document.name}</span>
            <Button variant={"ghost"} onClick={() => download(document)}>
              <LuDownload className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="border flex items-center w-full mx-auto rounded-md">
            <img
              src={path.to.file.previewFile(`${bucket}/${document.path}`)}
              className="object-contain"
              width={"680"}
              alt="Preview"
            />
          </div>
        </ResizablePanel>
      </>
    );
  } else if (document.type?.startsWith("PDF")) {
    return (
      <>
        <ResizableHandle withHandle />
        <ResizablePanel maxSize={75} minSize={25}>
          <div className="flex items-center justify-between">
            <Button isIcon variant={"ghost"} onClick={onClose}>
              <LuX className="w-4 h-4" />
            </Button>
            <span>{document.name}</span>
            <Button variant={"ghost"} onClick={() => download(document)}>
              <LuDownload className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <Document
            file={path.to.file.previewFile(`${bucket}/${document.path}`)}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<SkeletonDocument />}
          >
            <div className="overflow-auto " style={{ height: "92vh" }}>
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
  } else {
    return (
      <>
        <ResizableHandle withHandle />
        <ResizablePanel maxSize={75} minSize={25} className="bg-background">
          <div className="flex items-center justify-between">
            <Button isIcon variant={"ghost"} onClick={onClose}>
              <LuX className="w-4 h-4" />
            </Button>
          </div>
          <div className="py-16 flex flex-col items-center">
            <DocumentIcon type={document.type!} />
            <p className="text-xl mb-4 mt-2">
              {document.name} - {convertKbToString(document.size ?? 0)}
            </p>
            <Button onClick={() => download(document)}>
              <LuDownload className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </ResizablePanel>
      </>
    );
  }
};

export default DocumentView;
