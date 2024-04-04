"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { Award, Files, HeartHandshake, Receipt, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Purchasing",
    href: "",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Quoting and Sales Order",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Accounting",
    href: "",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Inventory",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Documents",
    href: "",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Resources",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];
const bentoItems = [
  {
    title: "Quote faster",
    description: "Create quotes and orders from your email with the help of AI",
    icon: <Receipt className="h-6 w-6 " />,
  },
  {
    title: "Close deals faster",
    description: "Track your sales pipeline and close deals faster",
    icon: <HeartHandshake className="h-6 w-6 " />,
  },
  {
    title: "Documents",
    description: "Store and view all your files in one place",
    icon: <Files className="h-6 w-6 " />,
  },
  {
    title: "Real Time ",
    description: "Explore the birth of groundbreaking ideas and inventions.",
    icon: <Zap className="h-6 w-6 " />,
  },
  {
    title: "Manufacturing",
    description: "Explore the birth of groundbreaking ideas and inventions.",
    icon: <Award className="h-6 w-6 " />,
  },
];

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <div className="inline-flex items-start justify-start shadow">
        <div className="relative h-8 w-8 rounded-lg border border-zinc-300 bg-gradient-to-b from-white to-zinc-300">
          <div className="absolute left-0 top-0 h-8 w-8"></div>
          <div className="absolute left-[8px] top-[8px] h-4 w-4 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 shadow"></div>
          <div className="absolute left-0 top-[16px] h-4 w-8 rounded-bl-lg rounded-br-lg bg-opacity-20 backdrop-blur-[5px]"></div>
        </div>
      </div>
      <span className="font-semibold text-2xl">carbon</span>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

function HeaderNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-zinc-50 text-lg">
            Why
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Why carbon
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components that you can copy
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="" title="Mission">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="" title="Launch">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="" title="Blog">
                Carbon Blog
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-zinc-50 text-lg">
            Products
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink
              className={(navigationMenuTriggerStyle(), "bg-zinc-50 text-lg")}
            >
              Get started for free
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
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
            <div className="inline-flex items-start justify-start gap-3">
              <Input type="email" className="w-[220px]" placeholder="Email" />
              <Button size="xl" className="relative">
                Get early access
                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-violet-400/90 to-violet-400/0 transition-opacity duration-500 group-hover:opacity-40" />
              </Button>
            </div>
          </div>
        </div>
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
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

export default function Home() {
  return (
    <div className="w-screen">
      {/* Hero header section */}
      <section className="flex flex-col items-center justify-start bg-zinc-50 ">
        <div className="flex h-20 container items-center justify-between ">
          <div className="flex gap-10">
            <Logo />
            <HeaderNavigationMenu />
          </div>
          <Button variant={"secondary"}>Log in</Button>
        </div>
        <div className="flex flex-col items-center justify-start gap-16 bg-grid-black/[0.1]">
          <ContainerScroll titleComponent={<></>}>
            <Image
              src={"/carbon-light.jpg"}
              alt="Carbon Screenshot"
              height={720}
              width={1400}
              className="mx-auto rounded-2xl object-cover h-full object-left-top"
              draggable={false}
            />
          </ContainerScroll>
        </div>
      </section>
      {/* Features section */}
      <section className="flex flex-col justify-center items-center gap-16 py-24">
        <div className=" h-40 flex-col justify-start items-center gap-12 inline-flex">
          <div className="h-40 flex-col justify-start items-center gap-5 flex">
            <div className="h-20 flex-col justify-start items-start gap-3 flex">
              <div className="self-stretch text-center text-blue-600 text-base font-semibold  ">
                Features
              </div>
              <div className="text-center text-zinc-900 text-4xl font-semibold  leading-[44px]">
                An ERP created to be your own
              </div>
            </div>
            <div className="max-w-2xl text-center text-zinc-600 text-xl font-normal  leading-[30px]">
              Every business is unique. Carbon gives you the basic building
              blocks to build your own proprietary business systems with the
              best modern, open-source software.
            </div>
          </div>
        </div>
        <BentoGrid className="max-w-4xl mx-auto">
          {bentoItems.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </section>
      {/* FAQ section */}
      <section className="py-24  mx-auto flex flex-col items-center bg-zinc-50">
        <div className="flex-col justify-start items-center gap-5 inline-flex">
          <div className="self-stretch text-center text-zinc-900 text-4xl font-semibold  leading-[44px]">
            Frequently asked questions
          </div>
          <div className="self-stretch text-center text-zinc-600 text-xl font-normal  leading-[30px]">
            Everything you need to know about the product and billing.
          </div>
        </div>
        <Accordion type="single" collapsible className="w-full max-w-2xl py-8">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that matches the other
              components&apos; aesthetic.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>
              Yes. It&apos;s animated by default, but you can disable it if you
              prefer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <section className="py-24 flex-col justify-center items-center flex">
        <div className="px-16 flex-col justify-start max-w-7xl gap-8 flex">
          <div className="self-stretch p-16 bg-zinc-50 rounded-2xl justify-start items-start gap-8 inline-flex">
            <div className="grow shrink basis-0 flex-col justify-start items-start gap-4 inline-flex">
              <div className="self-stretch text-zinc-900 text-3xl font-semibold  leading-[38px]">
                Start your 30-day free trial
              </div>
              <div className="self-stretch text-zinc-600 text-xl font-normal  leading-[30px]">
                Get up and running in less than 5 minutes.
              </div>
            </div>
            <div className="justify-start items-start gap-3 flex">
              <Button size="xl" variant={"outline"}>
                Learn more
              </Button>
              <Button size="xl">Get started</Button>
            </div>
          </div>
        </div>
      </section>
      <div className=" w-screen h-32 py-12 flex-col justify-start items-center gap-16 flex">
        <div className="self-stretch h-8 px-8 flex-col justify-start items-start gap-8 flex">
          <div className="self-stretch justify-between items-center inline-flex">
            <Logo />
            <div className="justify-center items-center gap-8 flex text-zinc-600 font-semibold">
              <p>Overview</p>
              <p>Features</p>
              <p>Pricing</p>
              <p>Careers</p>
              <p>Help</p>
              <p>Privacy</p>
            </div>
            <div className="w-40 text-right text-zinc-500 text-base font-normal  ">
              © 2024 Carbon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
