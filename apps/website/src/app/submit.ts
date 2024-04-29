"use server";
import { AssociationTypes, Client } from "@hubspot/api-client";
import {
  AssociationSpecAssociationCategoryEnum,
  FilterOperatorEnum,
  type PublicObjectSearchRequest,
} from "@hubspot/api-client/lib/codegen/crm/contacts";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

export async function createHubspotContact(formData: FormData) {
  try {
    const email = formData.get("email");
    if (typeof email !== "string") {
      throw new Error("Email is missing or not string");
    }
    const contactObj = {
      properties: {
        email: email,
      },
      associations: [],
    };
    await hubspotClient.crm.contacts.basicApi.create(contactObj);
  } catch (error) {
    console.error("Failed to submit email:", error);
  }
}
async function findContactByEmail(email: string) {
  const filter = {
    propertyName: "email",
    operator: FilterOperatorEnum.Eq,
    value: email,
  };

  try {
    const publicObjectSearchRequest: PublicObjectSearchRequest = {
      filterGroups: [{ filters: [filter] }],
      properties: ["email"],
      limit: 1,
      after: null,
      sorts: [],
    };
    const response = await hubspotClient.crm.contacts.searchApi.doSearch(
      publicObjectSearchRequest
    );
    if (response.results.length > 0) {
      return { success: true, contactId: response.results[0].id };
    } else {
      return { success: false, message: "No contact found." };
    }
  } catch (error) {
    console.error("Error searching contact by email:", error);
    return { success: false, message: error.message };
  }
}

async function associateCompanyWithContact(companyId, contactId) {
  try {
    await hubspotClient.crm.associations.v4.basicApi.create(
      "companies",
      companyId,
      "contacts",
      contactId,
      [
        {
          associationCategory:
            AssociationSpecAssociationCategoryEnum.HubspotDefined,
          associationTypeId: AssociationTypes.companyToContact,
        },
      ]
    );
    return { success: true, message: "Association created successfully." };
  } catch (error) {
    console.error("Error associating company with contact:", error);
    return { success: false, message: error.message };
  }
}

export async function createHubspotCompany(prevState: any, formData: FormData) {
  const schema = z.object({
    companyName: z.string(),
    erp: z.string(),
    companySize: z.string(),
    email: z.string(),
  });
  const data = schema.parse({
    companyName: formData.get("companyName"),
    erp: formData.get("erp"),
    companySize: formData.get("companySize"),
    email: formData.get("email"),
  });

  try {
    const companyObj = {
      properties: {
        name: data.companyName,
        description: data.erp ?? "",
        numberofemployees: data.companySize ?? "",
      },
      associations: [],
    };

    const createCompanyResponse =
      await hubspotClient.crm.companies.basicApi.create(companyObj);

    const contactId = await findContactByEmail(data.email);
    await associateCompanyWithContact(
      createCompanyResponse.id,
      contactId.contactId
    );
    revalidatePath("/");
    return { success: true, message: `Form Submitted` };
  } catch (error) {
    console.error("Error creating company:", error);
    return { success: false, message: `Failed to create company on Hubspot` };
  }
}
