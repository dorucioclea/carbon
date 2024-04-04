"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import React from "react";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <div className="flex h-8 items-center justify-center gap-2.5">
      <div className="inline-flex items-start justify-start shadow">
        <div className="relative h-8 w-8 rounded-lg border border-gray-300 bg-gradient-to-b from-white to-gray-300">
          <div className="absolute left-0 top-0 h-8 w-8"></div>
          <div className="absolute left-[8px] top-[8px] h-4 w-4 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 shadow"></div>
          <div className="absolute left-0 top-[16px] h-4 w-8 rounded-bl-lg rounded-br-lg bg-opacity-20 backdrop-blur-[5px]"></div>
        </div>
      </div>
      <span className="font-semibold">Carbon</span>
    </div>
  );
}

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

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
          <NavigationMenuTrigger className="bg-zinc-50">
            Getting started
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">carbon</div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components that you can copy and
                      paste into your apps. Accessible. Customizable. Open
                      Source.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-zinc-50">
            Components
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
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
              className={(navigationMenuTriggerStyle(), "bg-zinc-50")}
            >
              Documentation
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero header section */}
      <div className="flex w-screen flex-col items-center justify-start bg-zinc-50">
        <div className="w-full flex h-20 flex-col justify-center">
          <div className="flex container items-center justify-between px-8">
            <div className="flex gap-10">
              <Logo />
              <HeaderNavigationMenu />
            </div>
            <Button variant={"outline"}>Log in</Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-start gap-16 self-stretch py-24">
          <div className="flex  flex-col items-center justify-start gap-8 self-stretch px-8">
            <div className="flex  flex-col items-center justify-start gap-12 self-stretch">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="max-w-2xl text-center text-6xl font-semibold leading-[72px] text-gray-900">
                  Open Source ERP to power your business
                </div>
                <div className="self-stretch text-center text-xl font-normal leading-[30px]  text-slate-600">
                  Carbon is cloud manufacturing software that helps you make
                  better decisions faster.
                </div>
              </div>
              <div className="inline-flex items-start justify-start gap-3">
                <Button size="lg" variant={"outline"}>
                  Demo
                </Button>
                <Button size={"lg"}>Sign up</Button>
              </div>
            </div>
          </div>
          <div className="flex h-[512px] flex-col items-center justify-start gap-8 self-stretch px-8">
            <div className="flex h-[512px] flex-col items-center justify-start self-stretch">
              <div className="relative h-[512px] w-[768px] rounded-[10px] border-4 border-gray-900">
                <div className="absolute left-[28px] top-0 h-[512px] w-[712px] bg-black shadow"></div>
                <img
                  className="absolute left-0 top-0 h-[512px] w-[768px] rounded-[10px]"
                  src="https://via.placeholder.com/768x512"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
