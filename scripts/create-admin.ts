/**
 * Create / reset admin: ebu@zyra.com / test123
 * Usage: npx tsx --env-file=.env.local scripts/create-admin.ts
 */
import { randomUUID } from "crypto";
import { Client } from "pg";

const EMAIL = "ebu@zyra.com";
const PASSWORD = "test123";
const DISPLAY = "Ebu";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL required");

  const pg = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();
  await pg.query(`create extension if not exists pgcrypto`);

  const existing = await pg.query(
    `select id from auth.users where lower(email) = lower($1) limit 1`,
    [EMAIL],
  );

  let userId: string;
  if (existing.rows[0]?.id) {
    userId = existing.rows[0].id as string;
    await pg.query(
      `update auth.users
       set encrypted_password = crypt($2, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
       where id = $1`,
      [userId, PASSWORD],
    );
    console.log("Updated existing user", userId);
  } else {
    userId = randomUUID();
    await pg.query(
      `insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, recovery_token,
        email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', $1::uuid, 'authenticated', 'authenticated',
        $2, crypt($3, gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('display_name', $4::text),
        now(), now(), '', '', '', ''
      )`,
      [userId, EMAIL, PASSWORD, DISPLAY],
    );
    await pg.query(
      `insert into auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) values (
        $1::uuid, $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text),
        'email', $1::text, now(), now(), now()
      )
      on conflict do nothing`,
      [userId, EMAIL],
    );
    console.log("Created user", userId);
  }

  await pg.query(
    `insert into public.profiles (id, display_name, area, role)
     values ($1, $2, 'HQ', 'admin')
     on conflict (id) do update
       set display_name = excluded.display_name,
           role = 'admin'`,
    [userId, DISPLAY],
  );

  await pg.end();
  console.log(`Admin ready: ${EMAIL} / ${PASSWORD}`);
  console.log("Open /admin after login");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
