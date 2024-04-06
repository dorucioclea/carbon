import { zodResolver } from "@hookform/resolvers/zod";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { MotionValue } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const formSchema = z.object({
    email: z.string().email(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  const [showForm, setShowForm] = useState(true);
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
        setShowForm(false);
      }

      // const data = await response.json();
    } catch (error) {
      console.error("Failed to submit email:", error);
    }
  }
  const containerRef = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2"
      ref={containerRef}
    >
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center  bg-zinc-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div
        className="w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <div className="flex flex-col items-center justify-start gap-8 mb-60">
          <div className="flex flex-col items-center justify-start gap-12 ">
            <div className="flex flex-col items-center justify-center gap-6">
              <h1 className="max-w-2xl text-center text-6xl font-semibold text-zinc-900">
                ERP for the builders
              </h1>
              <div className="self-stretch text-center text-xl font-normal  text-zinc-600">
                Carbon is an open-source ERP to meet your exact manufacturing
                needs
              </div>
            </div>
            {showForm && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex w-full max-w-sm items-start space-x-2"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className="w-60"
                            type="email"
                            placeholder="Email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button size="xl" type="submit">
                    Get early access
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 bg-[#222222] rounded-[30px] shadow-xl"
    >
      <div className="h-full w-full  overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 md:rounded-2xl md:p-2">
        {children}
      </div>
    </motion.div>
  );
};
