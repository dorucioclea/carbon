import { Button } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { z } from "zod";
import { usePermissions } from "~/hooks";
import type { documentValidator } from "~/modules/documents";

type DocumentFormProps = {
  initialValues: z.infer<typeof documentValidator>;
  ownerId: string;
};

const ViewDocument = ({ initialValues, ownerId }: DocumentFormProps) => {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDisabled = !permissions.can("update", "documents");

  return (
    <div className="w-[600px] flex flex-col">
      <h1>Hello view your file</h1>
      <Button onClick={onClose}>close</Button>
    </div>
  );
};

export default ViewDocument;
