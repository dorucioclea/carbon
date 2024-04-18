"use server";
import { Client } from "@hubspot/api-client";
const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

export async function submit(formData: FormData) {
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
    const createContactResponse =
      await hubspotClient.crm.contacts.basicApi.create(contactObj);
    console.log(createContactResponse);
  } catch (error) {
    console.error("Failed to submit email:", error);
  }
}
