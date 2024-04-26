"use client";

import { createHubspotContact } from "@/app/submit";
import { Button, FormControl, Input } from "@carbon/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormMessage } from "./ui/Form";

export default function ContactForm() {
  const formSchema = z.object({
    email: z.string().email(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form
        action={createHubspotContact}
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
