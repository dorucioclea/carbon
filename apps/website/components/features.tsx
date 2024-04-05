import { Award, Files, HeartHandshake, Receipt, Zap } from "lucide-react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
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

export default function FeaturesSection() {
  return (
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
            Every business is unique. Carbon gives you the basic building blocks
            to build your own proprietary business systems with the best modern,
            open-source software.
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
  );
}
