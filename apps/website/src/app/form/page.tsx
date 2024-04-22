"use client";
import { BlurryCircle } from "~/components/BlurryCircle";
import CompanyForm from "~/components/CompanyForm";

export default function Form() {
  return (
    <div className="container flex flex-col w-full items-center mt-20 ">
      <BlurryCircle className="absolute top-[40%] right-40 bg-[#F59F95]/30 dark:bg-[#F59F95]/10 -z-10 hidden md:block" />
      <BlurryCircle className="absolute top-[70%] left-40 bg-[#3633D0]/10 dark:bg-[#3633D0]/10 -z-10 hidden md:block" />
      <CompanyForm />
    </div>
  );
}
