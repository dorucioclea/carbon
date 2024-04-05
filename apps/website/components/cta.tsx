import { Button } from "./ui/button";

export default function CtaSection() {
  return (
    <section className="flex-col justify-center items-center flex">
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
  );
}
