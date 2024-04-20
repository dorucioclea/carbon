"use client";
import CompanyForm from "~/components/CompanyForm";

export default function Form() {
  return (
    <div className="container flex flex-col w-full items-center mt-20 ">
      <h1 className="text-2xl font-semibold sm:text-2xl lg:text-4xl xl:text-5xl text-center">
        A few more questions
      </h1>
      <CompanyForm />
    </div>
  );
}
