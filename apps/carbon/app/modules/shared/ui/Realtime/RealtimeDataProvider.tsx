import idb from "localforage";
import { useEffect } from "react";
import { useUser } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import { useCustomers, useParts, usePeople, useSuppliers } from "~/stores";
import type { Part } from "~/stores/parts";
import type { ListItem } from "~/types";

let hydratedFromIdb = false;
let hydratedFromServer = false;

const RealtimeDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { supabase, accessToken } = useSupabase();
  const {
    company: { id: companyId },
  } = useUser();

  const [, setParts] = useParts();
  const [, setSuppliers] = useSuppliers();
  const [, setCustomers] = useCustomers();
  const [, setPeople] = usePeople();

  const hydrate = async () => {
    if (!hydratedFromIdb) {
      hydratedFromIdb = true;

      idb.getItem("customers").then((data) => {
        if (data && !hydratedFromServer) setCustomers(data as ListItem[], true);
      });
      idb.getItem("parts").then((data) => {
        if (data && !hydratedFromServer) setParts(data as Part[], true);
      });
      idb.getItem("suppliers").then((data) => {
        if (data && !hydratedFromServer) setSuppliers(data as ListItem[], true);
      });
      idb.getItem("people").then((data) => {
        // @ts-ignore
        if (data && !hydratedFromServer) setPeople(data, true);
      });
    }

    if (!supabase || !accessToken) return;

    const [parts, suppliers, customers, people] = await Promise.all([
      supabase
        .from("part")
        .select("id, name, replenishmentSystem")
        .eq("companyId", companyId)
        .eq("active", true)
        .eq("blocked", false)
        .order("name"),
      supabase
        .from("supplier")
        .select("id, name")
        .eq("companyId", companyId)
        .order("name"),
      supabase
        .from("customer")
        .select("id, name")
        .eq("companyId", companyId)
        .order("name"),
      supabase
        .from("employees")
        .select("id, name, avatarUrl")
        .eq("companyId", companyId)
        .order("name"),
    ]);

    if (parts.error || suppliers.error || customers.error || people.error) {
      throw new Error("Failed to fetch core data");
    }

    hydratedFromServer = true;

    setParts(parts.data ?? []);
    setSuppliers(suppliers.data ?? []);
    setCustomers(customers.data ?? []);
    // @ts-ignore
    setPeople(people.data ?? []);
  };

  useEffect(() => {
    if (!companyId) return;
    hydrate();

    if (!supabase || !accessToken) return;
    supabase.realtime.setAuth(accessToken);
    const channel = supabase
      .channel("realtime:core")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "part",
        },
        (payload) => {
          if ("companyId" in payload.new && payload.new.companyId !== companyId)
            return;
          switch (payload.eventType) {
            case "INSERT":
              const { new: inserted } = payload;
              setParts((parts) =>
                [
                  ...parts,
                  {
                    id: inserted.id,
                    name: inserted.name,
                    replenishmentSystem: inserted.replenishmentSystem,
                  },
                ].sort((a, b) => a.name.localeCompare(b.name))
              );
              break;
            case "UPDATE":
              const { new: updated } = payload;
              setParts((parts) =>
                parts
                  .map((p) => {
                    if (p.id === updated.id) {
                      return {
                        ...p,
                        name: updated.name,
                        replenishmentSystem: updated.replenishmentSystem,
                      };
                    }
                    return p;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
              );
              break;
            case "DELETE":
              const { old: deleted } = payload;
              setParts((parts) => parts.filter((p) => p.id !== deleted.id));
              break;
            default:
              break;
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer",
        },
        (payload) => {
          if ("companyId" in payload.new && payload.new.companyId !== companyId)
            return;
          switch (payload.eventType) {
            case "INSERT":
              const { new: inserted } = payload;
              setCustomers((customers) =>
                [
                  ...customers,
                  {
                    id: inserted.id,
                    name: inserted.name,
                  },
                ].sort((a, b) => a.name.localeCompare(b.name))
              );
              break;
            case "UPDATE":
              const { new: updated } = payload;
              setCustomers((customers) =>
                customers
                  .map((p) => {
                    if (p.id === updated.id) {
                      return {
                        ...p,
                        name: updated.name,
                      };
                    }
                    return p;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
              );
              break;
            case "DELETE":
              const { old: deleted } = payload;
              setCustomers((customers) =>
                customers.filter((p) => p.id !== deleted.id)
              );
              break;
            default:
              break;
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "supplier",
        },
        (payload) => {
          if ("companyId" in payload.new && payload.new.companyId !== companyId)
            return;
          switch (payload.eventType) {
            case "INSERT":
              const { new: inserted } = payload;

              setSuppliers((suppliers) =>
                [
                  ...suppliers,
                  {
                    id: inserted.id,
                    name: inserted.name,
                  },
                ].sort((a, b) => a.name.localeCompare(b.name))
              );
              break;
            case "UPDATE":
              const { new: updated } = payload;
              setSuppliers((suppliers) =>
                suppliers
                  .map((p) => {
                    if (p.id === updated.id) {
                      return {
                        ...p,
                        name: updated.name,
                      };
                    }
                    return p;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
              );
              break;
            case "DELETE":
              const { old: deleted } = payload;
              setSuppliers((suppliers) =>
                suppliers.filter((p) => p.id !== deleted.id)
              );
              break;
            default:
              break;
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employee",
        },
        async (payload) => {
          if ("companyId" in payload.new && payload.new.companyId !== companyId)
            return;
          // TODO: there's a cleaner way of doing this, but since customers and suppliers
          // are also in the users table, we can't automatically add/update/delete them
          // from our list of employees. So for now we just refetch.
          const { data } = await supabase
            .from("employees")
            .select("id, name, avatarUrl")
            .eq("companyId", companyId)
            .order("name");
          if (data) {
            // @ts-ignore
            setPeople(data);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, accessToken, companyId]);

  return <>{children}</>;
};

export default RealtimeDataProvider;
