import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { admin, claims, permissions } from "./seed/index";
import type { Database } from "./types";

dotenv.config();

const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_API_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const getUserId = async (): Promise<string> => {
  const existingUserId = await supabaseAdmin.auth.admin
    .listUsers()
    .then(
      ({ data }) =>
        data.users.find((user: User) => user?.email! === admin.email)?.id
    );

  if (existingUserId) return existingUserId;

  const newUserId = await supabaseAdmin.auth.admin
    .createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
    })
    .then(({ data }) => data.user?.id)
    .catch((e) => {
      throw e;
    });

  if (newUserId) return newUserId;

  throw new Error("Could not create or get user");
};

async function seed() {
  const id = await getUserId();

  const upsertAdmin = await supabaseAdmin.from("user").upsert([
    {
      id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    },
  ]);
  if (upsertAdmin.error) throw upsertAdmin.error;

  const upsertPermissions = await supabaseAdmin.from("userPermission").upsert([
    {
      id: id,
      permissions,
    },
  ]);
  if (upsertPermissions.error) throw upsertPermissions.error;

  // give the admin user all the claims
  await supabaseAdmin.auth.admin.updateUserById(id, {
    app_metadata: claims,
  });

  console.log(`Database has been seeded. 🌱\n`);
  console.log(
    `Admin user is 👇 \n🆔: ${id}\n📧: ${admin.email}\n🔑: ${admin.password}`
  );
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
