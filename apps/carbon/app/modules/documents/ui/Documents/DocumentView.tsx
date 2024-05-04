import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import { Suspense, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { path } from "~/utils/path";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
      <Drawer
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DrawerContent className="w-fit">
          <DrawerHeader>
            <DrawerTitle>{name}</DrawerTitle>
          </DrawerHeader>
          <Suspense>
            <div className="flex items-center justify-center border p-2 rounded-md">
              <img
                src={path.to.file.previewFile(`${bucket}/${pathToFile}`)}
                className="object-contain"
                width={"680"}
                alt="Preview"
              />
            </div>
          </Suspense>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="w-fit">
        <DrawerHeader>
          <DrawerTitle>{name}</DrawerTitle>
        </DrawerHeader>
        <Suspense>
          <Document
            file={path.to.file.previewFile(`${bucket}/${pathToFile}`)}
            onLoadSuccess={onDocumentLoadSuccess}
            className="h-full"
          >
            <div className="overflow-auto" style={{ height: "100vh" }}>
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  width={680}
                />
              ))}
            </div>
          </Document>
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
};

export default DocumentView;
