import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";

import { getSupabaseServiceRole } from "~/lib/supabase";
import { triggerClient } from "~/lib/trigger.server";
import { updatePermissions } from "~/modules/users/users.server";

const supabaseClient = getSupabaseServiceRole();
export const permissionsUpdateSchema = z.object({
  id: z.string(),
  addOnly: z.boolean(),
  permissions: z.record(
    z.string(),
    z.object({
      view: z.array(z.number()),
      create: z.array(z.number()),
      update: z.array(z.number()),
      delete: z.array(z.number()),
    })
  ),
});

const job = triggerClient.defineJob({
  id: "update-permissions",
  name: "Update Permissions",
  version: "0.0.1",
  trigger: eventTrigger({
    name: "update.permissions",
    schema: permissionsUpdateSchema,
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info(`🔰 Permission Update for ${payload.id}`);
    const { success, message } = await updatePermissions(
      supabaseClient,
      payload
    );
    if (success) {
      await io.logger.info(`✅ Permission Update for ${payload.id}`);
    } else {
      await io.logger.error(
        `❌ Permission Update for ${payload.id}: ${message}`
      );
    }
  },
});

export default job;
