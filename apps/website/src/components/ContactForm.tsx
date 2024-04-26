"use client";

import { Button, FormControl, Input } from "@carbon/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormMessage } from "./ui/Form";
import { useRouter } from "next/navigation";
import { createHubspotContact } from "@/app/submit";

export default function ContactForm() {
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  //TODO: update type
  const handleSubmit = async (data: any) => {
    try {
      await createHubspotContact(data);
      const email = encodeURIComponent(data.email);
      router.push(`/form?email=${email}`);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex space-x-2 items-center"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  size="lg"
                  type="email"
                  placeholder="Company email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button size="lg" type="submit">
          Subscribe
        </Button>
      </form>
    </Form>
  );
}
