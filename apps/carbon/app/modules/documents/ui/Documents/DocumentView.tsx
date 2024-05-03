import { Drawer, DrawerContent } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import { Suspense, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { path } from "~/utils/path";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const navigate = useNavigate();
  const onClose = () => navigate(path.to.documents);

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="w-fit">
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
