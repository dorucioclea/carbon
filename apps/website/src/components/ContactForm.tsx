"use client";

import {
  Button,
  FormControl,
  Input,
  useForm,
  zodResolver,
} from "@carbon/react";
import { z } from "zod";
import { Form, FormField, FormItem, FormMessage } from "./ui/Form";
import { submit } from "~/app/submit";

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
      <form action={submit} className="flex space-x-2 items-center">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
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
