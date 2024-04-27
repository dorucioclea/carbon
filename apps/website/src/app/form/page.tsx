"use client";

import CompanyForm from "@/components/CompanyForm";
import { Suspense } from "react";

export default function Form() {
  return (
    <div className="container flex flex-col w-full items-center mt-20 ">
      <Suspense>
        <CompanyForm />
      </Suspense>
    </div>
  );
}
