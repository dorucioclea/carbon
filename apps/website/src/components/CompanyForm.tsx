"use client";

import { createHubspotCompany } from "@/app/submit";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  FormControl,
  Input,
  Label,
} from "@carbon/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormMessage } from "./ui/Form";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  // const [state, formAction] = useFormState(createHubspotCompany, initialState);
  const createHubspotCompanyWithEmail = createHubspotCompany.bind(null, email);

  return (
    <Form {...form}>
      <form action={createHubspotCompanyWithEmail} className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center pb-8">
              We have a few more questions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid space-y-8">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label>What is your company called?</Label>
                    <Input
                      type="string"
                      placeholder="Company name"
                      {...field}
                    />
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
                    <Label>How big is your company?</Label>
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
                    <Label>What is your job title?</Label>
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
                    <Label>Which ERP do you use currently?</Label>
                    <Input type="string" placeholder="Excel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Submit</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
