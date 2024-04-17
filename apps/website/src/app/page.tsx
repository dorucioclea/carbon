"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import {
  Button,
  FormControl,
  Input,
  cn,
  useForm,
  zodResolver,
} from "@carbon/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsGithub, BsLightningCharge, BsPlay } from "react-icons/bs";
import { GiSpeedometer } from "react-icons/gi";
import { GoSync } from "react-icons/go";
import { HiCode, HiFingerPrint } from "react-icons/hi";
import { TbBuildingFactory2 } from "react-icons/tb";
import { z } from "zod";
import { Tabs } from "~/components/Tabs";
import { Form, FormField, FormItem, FormMessage } from "~/components/ui/Form";
import { MobileTabs } from "~/components/MobileTabs";
import { supabase } from "~/lib/supabase";

export default function Page() {
  return (
    <>
      <Hero />
      <ProductViews />
      <OpenCore />
      <Calendar />
    </>
  );
}

function Hero() {
  const [showForm, setShowForm] = useState(true);
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
        setShowForm(false);
      }

      // const data = await response.json();
    } catch (error) {
      console.error("Failed to submit email:", error);
    }
  }
  return (
    <>
      <div className="my-24 flex flex-col space-y-8 max-w-2xl mx-auto text-center">
        <p className="text-center mb-4">
          <Button
            className="border-border rounded-full"
            variant="secondary"
            leftIcon={<BsPlay />}
          >
            Watch the guided tour
          </Button>
        </p>
        <h1 className="text-zinc-900 mx-auto text-5xl font-semibold tracking-tight leading-tighter sm:text-5xl lg:text-6xl xl:text-7xl">
          <span className="text-foreground dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-b dark:from-white  dark:to-zinc-200">
            ERP for the builders
          </span>
        </h1>
        <div className="max-w-xl mx-auto text-center space-y-8">
          <p className="text-2xl font-medium leading-tight text-foreground/60 sm:text-lg md:text-xl lg:text-2xl">
            Powerful, modern and open, Carbon makes it easy to build the system
            your business needs.
          </p>
          {showForm && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col sm:flex-row w-full justify-center items-center space-y-4 sm:space-y-0 sm:space-x-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="w-60 border-primary"
                          type="email"
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button size="lg" type="submit">
                  Get early access
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}

const ImageContainer: React.FC<{ imagePath: string }> = ({ imagePath }) => {
  return (
    <div
      style={{
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 bg-[#222222] rounded-[30px] shadow-xl"
    >
      <Image
        src={imagePath}
        className="rounded-xl"
        width="1209"
        height="903"
        alt="carbon manufacturing"
      />
    </div>
  );
};

function ProductViews() {
  const tabs = [
    {
      title: "Manufacturing",
      description:
        "Infinitely nestable, infinitely customizable bill of materials.",
      value: "manufacturing",
      content: (
        <ImageContainer imagePath="/carbon-dark-mode-manufacturing.jpg" />
      ),
    },
    {
      title: "Accounting",
      description:
        "Realtime chart of accounts with double-entry accrual accounting",
      value: "accounting",
      content: (
        <ImageContainer imagePath={"/carbon-dark-mode-accounting.jpg"} />
      ),
    },
    {
      title: "Search",
      description: "Search across all your core or custom fields",
      value: "search",
      content: <ImageContainer imagePath={"/carbon-dark-mode-search.jpg"} />,
    },

    {
      title: "Permissions",
      description: "Fine-grained permissions for every user and every action",
      value: "permission",
      content: (
        <ImageContainer imagePath={"/carbon-dark-mode-permissions.jpg"} />
      ),
    },
    {
      title: "Documents",
      description: "Store and manage all your documents in one place",
      value: "documents",
      content: <ImageContainer imagePath={"/carbon-dark-mode-documents.jpg"} />,
    },
  ];
  const mobileTabs = [
    {
      id: 0,
      title: "Manufacturing",
      description:
        "Infinitely nestable, infinitely customizable bill of materials.",
      content: (
        <Image
          src="/carbon-dark-mode-manufacturing.jpg"
          className="rounded"
          width={1209}
          height={903}
          alt={""}
        />
      ),
    },
    {
      id: 1,
      content: (
        <Image
          src="/carbon-dark-mode-accounting.jpg"
          width={1209}
          height={903}
          alt={""}
        />
      ),
    },
  ];

  return (
    <>
      <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex-col max-w-5xl mx-auto w-full  items-start justify-start my-40 hidden md:flex">
        <Tabs tabs={tabs} />
      </div>
      <div className="flex sm:hidden mx-auto">
        <MobileTabs items={mobileTabs} />
      </div>
    </>
  );
}

const features = [
  {
    name: "High-Performance",
    icon: GiSpeedometer,
    description:
      "Built on best open-source technologies for incredible performance and security.",
  },
  {
    name: "Permissive License",
    icon: HiCode,
    description:
      "Unlike other open-source ERPs, you can use Carbon to build your own proprietary systems.",
  },
  {
    name: "Serverless",
    icon: GoSync,
    description:
      "So you can focus on your business systems, not your infrastructure.",
  },
  {
    name: "Realtime",
    icon: BsLightningCharge,
    description: "All data can be updated in realtime across applications.",
  },
  {
    name: "Manufacturing",
    icon: TbBuildingFactory2,
    description: "Carbon has first-class support for American manufacturing.",
  },
  {
    name: "Single Tenant",
    icon: HiFingerPrint,
    description:
      "You're not sharing databases with other companies. Your database is yours. Take it anytime.",
  },
] as const;

function OpenCore() {
  return (
    <section className="relative bg-background py-24 sm:py-36 lg:py-48 ">
      <div className="flex flex-col space-y-8 px-4 mx-auto  lg:max-w-7xl">
        <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl xl:text-6xl text-center text-foreground">
          Open Core
        </h2>
        <p className="mt-8 w-full text-center">
          <Button
            className="border-border rounded-full"
            variant="secondary"
            leftIcon={<BsGithub />}
            asChild
          >
            <Link href="https://git.new/carbon">Star us on GitHub</Link>
          </Button>
        </p>
        <p className="mx-auto text-xl font-medium text-foreground/60 lg:max-w-3xl lg:text-2xl text-center">
          Carbon is the only ERP that gives you full ownership over your
          software. With Carbon{" "}
          <span className="text-foreground">
            you aren&apos;t just a renter, you&apos;re an owner
          </span>
          .
        </p>

        <div className="grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {features.map(({ icon: Icon, ...feature }, i) => (
            <div
              className={cn(
                "row-span-1 group/bento items-start p-8 space-y-4 bg-black/[0.03] dark:bg-zinc-900 round transition-all duration-300 ease-in-out rounded-lg shadow group ring-2 ring-transparent hover:ring-white/10 cursor-pointer text-left"
              )}
              key={feature.name.split(" ").join("-")}
            >
              <Icon className="text-primary w-10 h-10" aria-hidden="true" />
              <h2 className="font-semibold text-foreground text-xl md:text-2xl lg:text-3xl tracking-tight">
                {feature.name}
              </h2>
              <p className="font-medium text-foreground/60 text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Calendar() {
  const { theme } = useTheme();
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: (theme ?? "light") as "dark" | "light",
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="flex flex-col items-center py-24 gap-8">
      <div className="text-4xl font-semibold tracking-tight lg:text-5xl xl:text-6xl text-center text-foreground">
        Chat with us
      </div>
      <Cal
        calLink="neilkanakia/quickchat"
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ layout: "month_view" }}
      />
    </section>
  );
}
