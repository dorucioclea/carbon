"use client";
import HeaderNavigationMenu from "@/components/header-nav";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-zinc-50">
      <div className="flex h-20 container items-center justify-between ">
        <div className="flex gap-10">
          <Logo />
          <HeaderNavigationMenu />
        </div>
        <Button variant={"secondary"}>Log in</Button>
      </div>
      {children}
    </div>
  );
}
