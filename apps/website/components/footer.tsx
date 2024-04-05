import Logo from "./logo";

export default function Footer() {
  return (
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
  );
}
