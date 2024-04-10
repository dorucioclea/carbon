"use client";

import { Button, cn } from "@carbon/react";
import Image from "next/image";
import Link from "next/link";
import { BsGithub, BsLightningCharge, BsPlay } from "react-icons/bs";
import { GiSpeedometer } from "react-icons/gi";
import { GoSync } from "react-icons/go";
import { HiCode, HiFingerPrint } from "react-icons/hi";
import { TbBuildingFactory2 } from "react-icons/tb";
import { Tabs } from "~/components/Tabs";

export default function Page() {
  return (
    <>
      <Hero />
      <ProductViews />
      <OpenCore />
    </>
  );
}

function Hero() {
  return (
    <>
      <div className="my-24 flex flex-col space-y-8 max-w-2xl mx-auto text-center">
        <p className="text-center mb-16">
          <Button
            className="border-border rounded-full"
            variant="secondary"
            leftIcon={<BsPlay />}
          >
            Watch the guided tour
          </Button>
        </p>
        <h1 className="mx-auto text-5xl font-bold tracking-tight leading-tighter sm:text-5xl lg:text-6xl xl:text-7xl">
          <span className="text-foreground dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-b dark:from-white  dark:to-zinc-200">
            ERP for the builders
          </span>
        </h1>
        <div className="max-w-xl mx-auto text-center space-y-8">
          <p className=" text-lg font-medium leading-tight text-foreground/60 sm:text-lg md:text-xl lg:text-2xl">
            Powerful, customizable and fast, Carbon makes it easy to build the
            exact ERP your business needs.
          </p>
          <p className="flex items-center justify-center space-x-2 w-full">
            <Button
              size="lg"
              variant="secondary"
              className="border border-border"
            >
              Subscribe
            </Button>
            <Button size="lg" variant="primary">
              Early Access
            </Button>
          </p>
        </div>
      </div>
    </>
  );
}

function ProductViews() {
  const tabs = [
    {
      title: "Manufacturing",
      description:
        "Infinitely nestable, infinitely customizable bill of materials.",
      value: "manufacturing",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 bg-gradient-to-br from-purple-300 to-orange-300">
          <Image
            src="/carbon-dark-mode-manufacturing.jpg"
            className="object-cover object-left-top h-[60%]  md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
            width="1209"
            height="903"
            alt="carbon manufacturing"
          />
        </div>
      ),
    },
    {
      title: "Accounting",
      description:
        "Realtime chart of accounts with double-entry accrual accounting",
      value: "accounting",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 bg-gradient-to-br from-purple-300 to-orange-300">
          <Image
            src="/carbon-dark-mode-accounting.jpg"
            className="object-cover object-left-top h-[60%]  md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
            width="1204"
            height="883"
            alt="carbon accounting"
          />
        </div>
      ),
    },
    {
      title: "Search",
      description: "Search across all your core or custom fields.",
      value: "search",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 bg-gradient-to-br from-purple-300 to-orange-300">
          <Image
            src="/carbon-dark-mode-search.jpg"
            className="object-cover object-left-top h-[60%]  md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
            width="1209"
            height="903"
            alt="carbon search"
          />
        </div>
      ),
    },

    {
      title: "Permissions",
      description: "Fine-grained permissions for every user and every action.",
      value: "permission",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 bg-gradient-to-br from-purple-300 to-orange-300">
          <Image
            src="/carbon-dark-mode-permissions.jpg"
            className="object-cover object-left-top h-[60%]  md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
            width="1209"
            height="903"
            alt="carbon screenshot"
          />
        </div>
      ),
    },
    {
      title: "Documents",
      description: "Store and manage all your documents in one place.",
      value: "documents",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-10 bg-gradient-to-br from-purple-300 to-orange-300">
          <Image
            src="/carbon-dark-mode-2.jpg"
            className="object-cover object-left-top h-[60%]  md:h-[90%] absolute -bottom-10 inset-x-0 w-[90%] rounded-xl mx-auto"
            width="1209"
            height="903"
            alt="carbon screenshot"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex-col max-w-5xl mx-auto w-full  items-start justify-start my-40 hidden md:flex">
      <Tabs tabs={tabs} />
    </div>
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
    name: "Serverless Architecture",
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
        <h2 className="text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl text-center text-foreground">
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
              <h2 className="font-bold text-foreground text-xl md:text-2xl lg:text-3xl tracking-tighter">
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
