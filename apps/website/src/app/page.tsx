import { BsFillHexagonFill } from "react-icons/bs";

export default function Page() {
  return (
    <div className="my-24 px-4 max-w-3xl mx-auto text-xl sm:text-2xl md:text-3xl text-foreground/80 leading-snug flex flex-col space-y-8">
      <p>
        Today, most business software is rented and not owned. Every month you
        pay for essentially the same thing you had last month. And if you stop
        paying, the software stops working.
      </p>

      <p>
        For the last 30 years, ERP companies have been taking advantage of this
        fact. Because they own the software, they make the rules. They
        overpromise and underdeliver because they believe there&apos;s nothing
        you can do about it.
      </p>

      <p>
        We think there&apos;s a better way. We think you should own the software
        that runs your business. We think you should have control over your code
        and your data.
      </p>

      <p>And we think we can help.</p>

      <p>
        <BsFillHexagonFill />
      </p>
    </div>
  );
}
