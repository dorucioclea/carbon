"use client";

import {
  Button,
  FormControl,
  Input,
  Label,
  useForm,
  zodResolver,
} from "@carbon/react";
import { z } from "zod";
import { createHubspotCompany } from "~/app/submit";
import { Form, FormField, FormItem, FormMessage } from "./ui/Form";

export default function CompanyForm() {
  const formSchema = z.object({
    companyName: z.string(),
    companySize: z.string(),
    jobTitle: z.string(),
    erp: z.string(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companySize: "",
      jobTitle: "",
      erp: "",
    },
  });

  return (
    <Form {...form}>
      <form action={createHubspotCompany}>
        <div className="mt-10 grid grid-cols-2 space-x-4 space-y-8">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Label>Company Name</Label>
                  <Input type="string" placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companySize"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Label>Company Size</Label>
                  <Input type="string" placeholder="E.g. 20-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Label>Job title</Label>
                  <Input type="string" placeholder="Job Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="erp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Label>What ERP do you use</Label>
                  <Input type="string" placeholder="Excel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
