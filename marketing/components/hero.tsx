import { ContainerScroll } from "./container-scroll";
import HeaderNavigationMenu from "./header-nav";
import Logo from "./logo";
import { Button } from "./ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-start bg-zinc-50">
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
  );
}
