import {
  BsFileEarmarkFill,
  BsFileEarmarkPlayFill,
  BsFileExcelFill,
  BsFileImageFill,
  BsFilePdfFill,
  BsFilePptFill,
  BsFileTextFill,
  BsFileWordFill,
  BsFileZipFill,
} from "react-icons/bs";
import type { documentTypes } from "~/modules/documents";

type DocumentIconProps = {
  type: (typeof documentTypes)[number];
};

const DocumentIcon = ({ type }: DocumentIconProps) => {
  switch (type) {
    case "Document":
      return <BsFileWordFill className="w-6 h-6 text-blue-500" />;
    case "Spreadsheet":
      return <BsFileExcelFill className="w-6 h-6 text-green-700" />;
    case "Presentation":
      return <BsFilePptFill className="w-6 h-6 text-orange-400" />;
    case "PDF":
      return <BsFilePdfFill className="w-6 h-6 text-red-600" />;
    case "Archive":
      return <BsFileZipFill className="w-6 h-6" />;
    case "Text":
      return <BsFileTextFill className="w-6 h-6" />;
    case "Image":
      return <BsFileImageFill className="w-6 h-6 text-yellow-400" />;
    case "Video":
      return <BsFileEarmarkPlayFill className="w-6 h-6 text-purple-500" />;
    case "Audio":
      return <BsFileEarmarkPlayFill className="w-6 h-6 text-cyan-400" />;
    case "Other":
    default:
      return <BsFileEarmarkFill className="w-6 h-6" />;
  }
};

export default DocumentIcon;
