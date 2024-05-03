import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { useSupabase } from "~/lib/supabase";
import { useUser } from "./useUser";

export function useRealtime(table: string, filter?: string) {
  const { company } = useUser();
  const { accessToken, supabase } = useSupabase();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (!supabase || !accessToken || !table) return;
    supabase.realtime.setAuth(accessToken);

    const channel = supabase
      .channel(`postgres_changes:${table}}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: filter,
        },
        (payload) => {
          if (
            "companyId" in payload.new &&
            payload.new.companyId !== company.id
          )
            return;

          revalidator.revalidate();
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
  }, [
    revalidator.revalidate,
    supabase,
    table,
    filter,
    accessToken,
    revalidator,
    company.id,
  ]);
}
