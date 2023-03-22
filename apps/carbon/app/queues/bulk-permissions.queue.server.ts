import { Queue } from "~/lib/bullmq";
import { getSupabaseServiceRole } from "~/lib/supabase";
import type { Permission } from "~/modules/users";
import { updatePermissions } from "~/modules/users";

export type BulkPermissionsQueueData = {
  id: string;
  permissions: Record<string, Permission>;
  addOnly: boolean;
};

const client = getSupabaseServiceRole();

export const bulkPermissionsQueue = Queue<BulkPermissionsQueueData>(
  "editBulkPermissions:v1",
  async (job) => {
    await updatePermissions(client, job.data);
  }
);
