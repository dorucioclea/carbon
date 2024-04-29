import { Button } from "@carbon/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { z } from "zod";
import type { documentValidator } from "~/modules/documents";
import { requirePermissions } from "~/services/auth";

const supportedFileTypes: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  wmv: "video/x-ms-wmv",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
};

type DocumentFormProps = {
  initialValues: z.infer<typeof documentValidator>;
  ownerId: string;
};
const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { client } = await requirePermissions(request, {
    view: "documents",
  });
  const { bucket } = params;
  const path = params["*"];

  if (!bucket) throw new Error("Bucket not found");
  if (!path) throw new Error("Path not found");

  const fileType = path.split(".").pop();
  if (!fileType || !(fileType in supportedFileTypes))
    throw new Error("File type not supported");
  const contentType = supportedFileTypes[fileType];

  const result = await client.storage.from(bucket).download(`${path}`);
  if (result.error) {
    throw new Error("Failed to load file");
  }

  const headers = new Headers({ "Content-Type": contentType });
  return new Response(result.data, { status: 200, headers });
};

const ViewDocument = ({ initialValues, ownerId }: DocumentFormProps) => {
  const navigate = useNavigate();
  const onClose = () => navigate(-1);
  const data = useLoaderData<typeof loader>();
  console.log(data);

  return (
    <div className="w-[600px] flex flex-col">
      <Button className="mb-2" onClick={onClose}>
        close
      </Button>
      <iframe
        seamless
        title={data.document.name}
        width="425"
        height="550"
        src={data.document.path}
      />
    </div>
  );
};

export default ViewDocument;
