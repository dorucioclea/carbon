import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
export default function Calendar() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);
  return (
    <section className="flex flex-col items-center py-24 gap-8">
      <div className="self-stretch text-center text-zinc-900 text-4xl font-semibold  leading-[44px]">
        Chat with us
      </div>
      <Cal
        calLink="neilkanakia/quickchat"
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ layout: "month_view" }}
      />
    </section>
  );
}
