"use server";
import { Client } from "@hubspot/api-client";
import { redirect } from "next/navigation";

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

export async function createHubspotCompany(formData: FormData) {
  try {
    const companyName = formData.get("companyName");
    if (typeof companyName !== "string") {
      throw new Error("Company Name is missing or not string");
    }
    // const companyObj = {
    //   properties: {
    //     name: companyName,
    //   },
    //   associations: [],
    // };
    // await hubspotClient.crm.companies.basicApi.create(contactObj);
    redirect("/form");
  } catch (error) {
    console.error("Failed to submit Company:", error);
  }
}
