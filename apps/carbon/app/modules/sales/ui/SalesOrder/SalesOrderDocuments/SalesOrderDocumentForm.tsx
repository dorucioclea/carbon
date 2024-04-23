import { File, toast } from "@carbon/react";
import { useSubmit } from "@remix-run/react";
import type { ChangeEvent } from "react";
import { IoMdAdd } from "react-icons/io";
import { useUser } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import { path } from "~/utils/path";

type SalesOrderDocumentFormProps = {
  orderId: string;
  isExternal: boolean;
};

const SalesOrderDocumentForm = ({
  orderId,
  isExternal,
}: SalesOrderDocumentFormProps) => {
  const submit = useSubmit();
  const { supabase } = useSupabase();
  const { id: companyId } = useUser();

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && supabase) {
      const file = e.target.files[0];
      const fileName = `${companyId}/sales-order/${
        isExternal ? "external" : "internal"
      }/${orderId}/${file.name}`;

      const fileUpload = await supabase.storage
        .from("private")
        .upload(fileName, file, {
          cacheControl: `${12 * 60 * 60}`,
        });

      if (fileUpload.error) {
        toast.error("Failed to upload file");
      }

      if (fileUpload.data?.path) {
        toast.success("File uploaded");
        submitFileData({
          path: fileUpload.data.path,
          name: file.name,
          size: file.size,
        });
      }
    }
  };

  const submitFileData = ({
    path: filePath,
    name,
    size,
  }: {
    path: string;
    name: string;
    size: number;
  }) => {
    const formData = new FormData();
    formData.append("path", filePath);
    formData.append("name", name);
    formData.append("size", Math.round(size / 1024).toString());
    formData.append("sourceDocument", "Sales Order");
    formData.append("sourceDocumentId", orderId);

    submit(formData, {
      method: "post",
      action: path.to.newDocument,
    });
  };

  return (
    <File leftIcon={<IoMdAdd />} onChange={uploadFile}>
      New
    </File>
  );
};

export default SalesOrderDocumentForm;
