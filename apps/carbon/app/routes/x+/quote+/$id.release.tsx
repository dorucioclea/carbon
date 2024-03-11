import { QuoteEmail } from "@carbon/documents";
import { validationError, validator } from "@carbon/remix-validated-form";
import { renderAsync } from "@react-email/components";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { triggerClient } from "~/lib/trigger.server";
// import {
//   getPurchaseOrder,
//   getPurchaseOrderLines,
//   getPurchaseOrderLocations,
//   getSupplierContact,
// } from "~/modules/purchasing";
import {
  getQuote,
  releaseQuote,
  quotationReleaseValidator,
  getCustomer,
} from "~/modules/sales";
import { getCompany } from "~/modules/settings";
// import { getUser } from "~/modules/users/users.server";
// import { loader as pdfLoader } from "~/routes/file+/purchase-order+/$id[.]pdf";
import { loader as pdfLoader } from "~/routes/file+/quote+/$quoteId[.]pdf";
import { requirePermissions } from "~/services/auth";
import { flash } from "~/services/session.server";
import { assertIsPost } from "~/utils/http";
import { path } from "~/utils/path";
import { error, success } from "~/utils/result";

export async function action(args: ActionFunctionArgs) {
  const { request, params } = args;
  assertIsPost(request);

  const { client, userId } = await requirePermissions(request, {
    create: "purchasing",
    role: "employee",
  });

  const { id } = params;
  if (!id) throw new Error("Could not find id");

  let file: ArrayBuffer;
  let bucketName = id;
  let fileName: string;

  const release = await releaseQuote(client, id, userId);
  if (release.error) {
    return redirect(
      path.to.quote(id),
      await flash(request, error(release.error, "Failed to release quote"))
    );
  }

  const quote = await getQuote(client, id);
  if (quote.error) {
    return redirect(
      path.to.quote(id),
      await flash(request, error(quote.error, "Failed to get quote"))
    );
  }

  try {
    const pdf = await pdfLoader(args);
    if (pdf.headers.get("content-type") !== "application/pdf")
      throw new Error("Failed to generate PDF");

    file = await pdf.arrayBuffer();
    fileName = `${quote.data.quoteId} - ${new Date()
      .toISOString()
      .slice(0, -5)}.pdf`;

    const fileUpload = await client.storage
      .from("purchasing-external")
      .upload(`${bucketName}/${fileName}`, file, {
        cacheControl: `${12 * 60 * 60}`,
        contentType: "application/pdf",
      });

    if (fileUpload.error) {
      return redirect(
        path.to.purchaseOrder(id),
        await flash(request, error(fileUpload.error, "Failed to upload file"))
      );
    }
  } catch (err) {
    return redirect(
      path.to.purchaseOrder(id),
      await flash(request, error(err, "Failed to generate PDF"))
    );
  }

  const validation = await validator(quotationReleaseValidator).validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { notification, customerContact } = validation.data;

  switch (notification) {
    case "Email":
      try {
        if (!customerContact) throw new Error("Customer contact is required");

        const [
          company,
          customer,
          // supplier,
          // purchaseOrder,
          // purchaseOrderLines,
          // purchaseOrderLocations,
          // buyer,
        ] = await Promise.all([
          getCompany(client),
          getCustomer(client, quote.data.customerId),
          // getSupplierContact(client, customerContact),
          // getPurchaseOrder(client, id),
          // getPurchaseOrderLines(client, id),
          // getPurchaseOrderLocations(client, id),
          // getUser(client, userId),
        ]);

        // if (!supplier?.data?.contact) throw new Error("Failed to get supplier contact");
        if (!company.data) throw new Error("Failed to get company");
        // if (!buyer.data) throw new Error("Failed to get user");
        // if (!purchaseOrder.data) throw new Error("Failed to get purchase order");
        // if (!purchaseOrderLocations.data) throw new Error("Failed to get purchase order locations");

        // const emailTemplate = PurchaseOrderEmail({
        //   company: company.data,
        //   purchaseOrder: purchaseOrder.data,
        //   purchaseOrderLines: purchaseOrderLines.data ?? [],
        //   purchaseOrderLocations: purchaseOrderLocations.data,
        //   recipient: {
        //     email: supplier.data.contact.email,
        //     firstName: supplier.data.contact.firstName,
        //     lastName: supplier.data.contact.lastName,
        //   },
        //   sender: {
        //     email: buyer.data.email,
        //     firstName: buyer.data.firstName,
        //     lastName: buyer.data.lastName,
        //   },
        // });

        // TODO: Update sender email
        const emailTemplate = QuoteEmail({
          company: company.data,
          quote: quote.data,
          recipient: {
            email: customerContact,
            firstName: "Customer",
            lastName: "",
          },
          sender: {
            email: "kanakianeil@gmail.com",
            firstName: "Neil",
            lastName: "Kanakia",
          },
        });

        await triggerClient.sendEvent({
          name: "resend.email",
          payload: {
            to: [customer.data.contact.email],
            // TODO: Update from email
            from: "kanakianeil@gmail.com",
            subject: `${quote.data.quoteId} from ${company.data.name}`,
            html: await renderAsync(emailTemplate),
            text: await renderAsync(emailTemplate, { plainText: true }),
            attachments: [
              {
                content: Buffer.from(file),
                filename: fileName,
              },
            ],
          },
        });
      } catch (err) {
        return redirect(
          path.to.purchaseOrder(id),
          await flash(request, error(err, "Failed to send email"))
        );
      }

      break;
    case undefined:
    case "None":
      break;
    default:
      throw new Error("Invalid notification type");
  }

  return redirect(
    path.to.purchaseOrderExternalDocuments(id),
    await flash(request, success("Purchase order released"))
  );
}
