"use client";

import { NavigationMenu } from "@/components/Navigation";
import {
  Badge,
  Button,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  cn,
  useDisclosure,
} from "@carbon/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsFillHexagonFill } from "react-icons/bs";
import { GoArrowUpRight } from "react-icons/go";

const links = [
  {
    title: "Story",
    path: "/story",
  },
  {
    title: "Updates",
    path: "/updates",
  },
  // {
  //   title: "Product",
  //   path: "/product",
  // },
  // {
  //   title: "Pricing",
  //   path: "/pricing",
  // },
  {
    title: "Code",
    path: "https://git.new/carbon",
  },
  {
    title: "Docs",
    path: "https://docs.crbnerp.com",
  },
];

const listVariant = {
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
  hidden: {
    opacity: 0,
  },
};

const itemVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export function Header() {
  const pathname = usePathname();
  const mobileMenu = useDisclosure();

  const toggleMenu = () => {
    document.body.style.overflow = mobileMenu.isOpen ? "" : "hidden";
    mobileMenu.onToggle();
  };

  return (
    <header className="h-12 sticky mt-4 top-4 z-50 px-2 md:px-4 md:flex justify-center">
      <nav className="border border-border p-3 rounded-xl flex items-center backdrop-filter backdrop-blur-xl bg-[#FDFDFC] dark:bg-[#121212] bg-opacity-70">
        <NavigationMenu>
          <Link href="/" className="flex space-x-2 items-center">
            <span className="sr-only">Carbon Logo</span>
            <BsFillHexagonFill />

            <Badge
              variant="secondary"
              className="rounded-full border-border border text-xs cursor-progress"
            >
              Alpha
            </Badge>
          </Link>

          <ul className="space-x-2 font-medium text-sm hidden md:flex mx-2">
            {links.map(({ path, title }) => {
              const isActive = pathname.includes(path);
              const isExternal = path.startsWith("http");

              return (
                <Button
                  key={path}
                  variant={isActive ? "active" : "ghost"}
                  rightIcon={isExternal ? <GoArrowUpRight /> : undefined}
                  asChild
                >
                  <Link href={path}>{title}</Link>
                </Button>
              );
            })}
          </ul>
        </NavigationMenu>

        <button
          type="button"
          className="ml-auto md:hidden p-2"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={14}
            height={14}
            fill="none"
          >
            <path
              fill="currentColor"
              d="M0 12.195v-2.007h18v2.007H0Zm0-5.017V5.172h18v2.006H0Zm0-5.016V.155h18v2.007H0Z"
            />
          </svg>
        </button>

        <Modal>
          <ModalTrigger asChild>
            <Button className="hidden md:inline-flex">Subscribe</Button>
          </ModalTrigger>
          <ModalContent className="sm:max-w-[425px]">
            <ModalHeader>
              <ModalTitle>Sign Up</ModalTitle>
              <ModalDescription>
                Enter your email address to sign up for early access.
              </ModalDescription>
            </ModalHeader>
            <div className="grid py-4">
              <div className="grid grid-cols-1 items-center">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input placeholder="Email" id="email" />
              </div>
            </div>
            <ModalFooter>
              <Button size="lg" type="submit">
                Sign Up
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </nav>

      {mobileMenu.isOpen && (
        <motion.div
          className="fixed bg-background top-0 right-0 left-0 bottom-0 h-screen z-10 px-2 m-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mt-4 flex justify-between p-3 relative">
            <button type="button" onClick={toggleMenu}>
              <span className="sr-only">Carbon Logo</span>
              <BsFillHexagonFill />
            </button>

            <button
              type="button"
              className="ml-auto md:hidden p-2 absolute right-[10px] top-2"
              onClick={toggleMenu}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                className="fill-primary"
              >
                <path fill="none" d="M0 0h24v24H0V0z" />
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </div>

          <div className="h-full overflow-auto">
            <motion.ul
              initial="hidden"
              animate="show"
              className="px-3 pt-8 text-xl text-[#707070] dark:text-[#878787] space-y-8 mb-8"
              variants={listVariant}
            >
              {links.map(({ path, title }) => {
                const isActive = pathname.includes(path);

                return (
                  <motion.li variants={itemVariant} key={path}>
                    <Link
                      href={path}
                      className={cn(isActive && "text-primary")}
                      onClick={toggleMenu}
                    >
                      {title}
                    </Link>
                  </motion.li>
                );
              })}

              <motion.li
                variants={itemVariant}
                className="flex items-center space-x-2"
              >
                <Link href="https://git.new/carbon">Code</Link>
              </motion.li>

              <motion.li variants={itemVariant}>
                <Link className="text-xl text-primary" href="#">
                  Subscribe
                </Link>
              </motion.li>
            </motion.ul>
          </div>
        </motion.div>
      )}
    </header>
  );
}
