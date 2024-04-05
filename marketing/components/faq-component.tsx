import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
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
          <AccordionTrigger>What is carbon?</AccordionTrigger>
          <AccordionContent>
            Carbon is a free and open source ERp system that you will OWN. What
            makes it different from other solutions is that you are no longer
            just a tenant but a landlord. You have to option to deploy it on
            your own servers for free.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do you make money?</AccordionTrigger>
          <AccordionContent>
            If you are not interested in hosting your own instance and managing
            servers. We the creators of Carbon can help you get started and
            handle the hosting and maintenance of the software.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Can I try it out for free?</AccordionTrigger>
          <AccordionContent>
            Absolutely. You can try out a deployed instance of Carbon for free
            for the first 30 days. If you feel it is the right match then you
            can continue to use the deployed version of it.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Is it customizable?</AccordionTrigger>
          <AccordionContent>
            The core values of carbon are to be simpel and customizable. We
            offer you the tools to easily customize and set up your workflows.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
