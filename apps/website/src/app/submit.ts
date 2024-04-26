"use server";
import { Client } from "@hubspot/api-client";
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

export async function createHubspotCompany(email: string, formData: FormData) {
  const schema = z.object({
    companyName: z.string(),
  });
  const data = schema.parse({
    companyName: formData.get("companyName"),
  });

  try {
    const companyObj = {
      properties: {
        name: data.companyName,
      },
      associations: [],
    };

    const createCompanyResponse =
      await hubspotClient.crm.companies.basicApi.create(companyObj);
    // revalidatePath("/form");

    return { message: `Added ${createCompanyResponse}` };
  } catch (error) {
    return { message: `Failed to create company on Hubspot` };
  }
}
