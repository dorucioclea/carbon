"use client";
import {
  Button,
  FormControl,
  Input,
  useForm,
  zodResolver,
} from "@carbon/react";
import { z } from "zod";
import { supabase } from "~/lib/supabase";
import { Form, FormField, FormItem, FormMessage } from "./ui/Form";

export default function EmailForm() {
  const formSchema = z.object({
    email: z.string().email(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await supabase
        .from("leads")
        .insert({ email: values.email });

      if (response.error) {
        form.setError("email", {
          type: "manual",
          message: "Failed to insert email",
        });
        console.error(response.error.message);
      } else {
        form.reset();
        form.clearErrors();
      }
    } catch (error) {
      console.error("Failed to submit email:", error);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex space-x-2 items-center"
      >
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
        <Button size="lg" variant="ghost" type="submit">
          Subscribe
        </Button>
      </form>
    </Form>
  );
}
