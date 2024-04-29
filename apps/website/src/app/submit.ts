"use server";
import { AssociationTypes, Client } from "@hubspot/api-client";
import {
  AssociationSpecAssociationCategoryEnum,
  FilterOperatorEnum,
  type PublicObjectSearchRequest,
} from "@hubspot/api-client/lib/codegen/crm/contacts";
import { z } from "zod";

const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

type Result = {
  success: boolean;
  message?: string;
};

export async function createHubspotContact(
  formData: FormData
): Promise<Result> {
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
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
async function findContactByEmail(
  email: string
): Promise<
  { success: true; contactId: string } | { success: false; message: string }
> {
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
    return { success: false, message: error.message };
  }
}

const companySchema = z.object({
  companyName: z.string(),
  erp: z.string(),
  companySize: z.string(),
  email: z.string(),
});

export async function createHubspotCompany(
  prevState: any,
  formData: FormData
): Promise<Result> {
  try {
    const data = companySchema.parse({
      companyName: formData.get("companyName"),
      erp: formData.get("erp"),
      companySize: formData.get("companySize"),
      email: formData.get("email"),
    });

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

    const contact = await findContactByEmail(data.email);
    if (contact.success) {
      await associateCompanyWithContact(
        createCompanyResponse.id,
        contact.contactId
      );

      return { success: true };
    } else {
      return contact;
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: `Failed to create company` };
  }
}
