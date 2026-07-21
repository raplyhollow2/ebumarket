/**
 * Seed demo personas into live Supabase via Postgres (bypasses auth email rate limits).
 * Usage: npm run seed
 */
import { randomUUID } from "crypto";
import { Client } from "pg";

const dbUrl = process.env.DATABASE_URL!;

const users = [
  {
    email: "maya@example.com",
    password: "zyra-demo-maya",
    display_name: "Maya",
    area: "Northside",
    role: "user",
    meetup: "Mall food court",
  },
  {
    email: "jordan@example.com",
    password: "zyra-demo-jordan",
    display_name: "Jordan",
    area: "West End",
    role: "user",
    meetup: "Library steps",
  },
  {
    email: "sam@example.com",
    password: "zyra-demo-sam",
    display_name: "Sam",
    area: "Eastside",
    role: "user",
    meetup: "Community center",
  },
  {
    email: "alex@example.com",
    password: "zyra-demo-alex",
    display_name: "Alex",
    area: "HQ",
    role: "admin",
    meetup: null as string | null,
  },
] as const;

const placeholder =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80";

async function ensureUser(
  pg: Client,
  u: (typeof users)[number],
): Promise<string> {
  const existing = await pg.query(
    `select id from auth.users where email = $1 limit 1`,
    [u.email],
  );
  if (existing.rows[0]?.id) {
    const id = existing.rows[0].id as string;
    await pg.query(
      `update auth.users
       set encrypted_password = crypt($2, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now())
       where id = $1`,
      [id, u.password],
    );
    return id;
  }

  const id = randomUUID();
  await pg.query(
    `insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated',
      $2, crypt($3, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name', $4::text, 'area', $5::text),
      now(), now(), '', '', '', ''
    )`,
    [id, u.email, u.password, u.display_name, u.area],
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
    [id, u.email],
  );

  return id;
}

async function main() {
  if (!dbUrl) throw new Error("DATABASE_URL required");
  const pg = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  // pgcrypto for crypt()
  await pg.query(`create extension if not exists pgcrypto`);

  const ids: Record<string, string> = {};
  for (const u of users) {
    const id = await ensureUser(pg, u);
    ids[u.display_name] = id;
    await pg.query(
      `insert into public.profiles (id, display_name, area, role)
       values ($1, $2, $3, $4)
       on conflict (id) do update
         set display_name = excluded.display_name,
             area = excluded.area,
             role = excluded.role`,
      [id, u.display_name, u.area, u.role],
    );
    if (u.meetup) {
      await pg.query(
        `insert into public.meetup_points (user_id, label)
         select $1, $2
         where not exists (
           select 1 from public.meetup_points where user_id = $1 and label = $2
         )`,
        [id, u.meetup],
      );
    }
    console.log("user", u.display_name, id);
  }

  // Avoid duplicate seed spam: delete previous seed titles for Maya/Sam then reinsert
  const maya = ids.Maya;
  const sam = ids.Sam;
  if (maya) {
    await pg.query(
      `delete from public.listings
       where seller_id = $1
         and title in ('Denim jacket', 'Graphic tee', 'Hoodie (pending)')`,
      [maya],
    );
    const samples = [
      {
        title: "Denim jacket",
        category: "Outerwear",
        size: "M",
        condition: "Good",
        price: 2000,
        status: "verified",
      },
      {
        title: "Graphic tee",
        category: "Tops",
        size: "S",
        condition: "Like new",
        price: 800,
        status: "verified",
      },
      {
        title: "Hoodie (pending)",
        category: "Tops",
        size: "L",
        condition: "Good",
        price: 1500,
        status: "pending",
      },
    ];
    for (const s of samples) {
      const { rows } = await pg.query(
        `insert into public.listings
          (seller_id, type, title, description, category, size, condition, price_cents, status, verified_at)
         values ($1,'marketplace',$2,$3,$4,$5,$6,$7,$8,
           case when $8 = 'verified' then now() else null end)
         returning id`,
        [
          maya,
          s.title,
          "Seed listing for usability tests.",
          s.category,
          s.size,
          s.condition,
          s.price,
          s.status,
        ],
      );
      const listingId = rows[0].id as string;
      for (const [i, angle] of ["front", "back", "tag", "defect"].entries()) {
        await pg.query(
          `insert into public.listing_photos (listing_id, angle, storage_path, public_url, sort_order)
           values ($1,$2,$3,$4,$5)`,
          [listingId, angle, `seed/${listingId}/${angle}`, placeholder, i],
        );
      }
      console.log("listing", s.title, s.status);
    }
  }

  if (sam) {
    await pg.query(
      `delete from public.listings where seller_id = $1 and title = 'Cozy sweater'`,
      [sam],
    );
    const { rows } = await pg.query(
      `insert into public.listings
        (seller_id, type, title, description, category, size, condition, price_cents, status, verified_at)
       values ($1,'donation','Cozy sweater','Free donation seed item.','Tops','M','Good',null,'verified', now())
       returning id`,
      [sam],
    );
    const listingId = rows[0].id as string;
    for (const [i, angle] of ["front", "back", "tag", "defect"].entries()) {
      await pg.query(
        `insert into public.listing_photos (listing_id, angle, storage_path, public_url, sort_order)
         values ($1,$2,$3,$4,$5)`,
        [listingId, angle, `seed/${listingId}/${angle}`, placeholder, i],
      );
    }
    console.log("donation seeded");
  }

  await pg.end();
  console.log("\nDemo logins:");
  for (const u of users) {
    console.log(`  ${u.display_name}: ${u.email} / ${u.password}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
