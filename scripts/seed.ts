/**
 * Seed demo personas + verified Market / Donation listings into live Supabase.
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
    area: "Thimphu",
    role: "user",
    meetup: "Clock Tower Square",
  },
  {
    email: "jordan@example.com",
    password: "zyra-demo-jordan",
    display_name: "Jordan",
    area: "Paro",
    role: "user",
    meetup: "Paro town square",
  },
  {
    email: "sam@example.com",
    password: "zyra-demo-sam",
    display_name: "Sam",
    area: "Phuentsholing",
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

type SeedListing = {
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  price: number | null;
  type: "marketplace" | "donation";
  status: "verified" | "pending";
  image: string;
  seller: "Maya" | "Jordan" | "Sam";
};

/** Distinct Unsplash fashion images for seed photos */
const IMAGES = {
  denim:
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
  tee: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  hoodie:
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  dress:
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  sneakers:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  jacket:
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80",
  skirt:
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
  sweater:
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
  pants:
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
  bag: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
  boots:
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
  shirt:
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
  coat: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80",
  shorts:
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80",
  scarf:
    "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80",
  kids: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80",
};

const CATALOG: SeedListing[] = [
  // Marketplace — Maya
  {
    seller: "Maya",
    type: "marketplace",
    status: "verified",
    title: "Vintage denim jacket",
    description: "Classic blue denim, lightly worn. Great for Thimphu evenings.",
    category: "Outerwear",
    size: "M",
    condition: "Good",
    price: 2500,
    image: IMAGES.denim,
  },
  {
    seller: "Maya",
    type: "marketplace",
    status: "verified",
    title: "Graphic tee — mountain print",
    description: "Soft cotton tee, worn twice. Smoke-free home.",
    category: "Tops",
    size: "S",
    condition: "Like new",
    price: 800,
    image: IMAGES.tee,
  },
  {
    seller: "Maya",
    type: "marketplace",
    status: "verified",
    title: "Floral summer dress",
    description: "Light midi dress, perfect for festivals. No stains.",
    category: "Dresses",
    size: "M",
    condition: "Good",
    price: 1800,
    image: IMAGES.dress,
  },
  {
    seller: "Maya",
    type: "marketplace",
    status: "verified",
    title: "Black ankle boots",
    description: "Size fits true. Small scuff on heel (shown in defect photo).",
    category: "Shoes",
    size: "M",
    condition: "Fair",
    price: 2200,
    image: IMAGES.boots,
  },
  {
    seller: "Maya",
    type: "marketplace",
    status: "pending",
    title: "Oversized hoodie (pending)",
    description: "Awaiting Zyra photo review.",
    category: "Tops",
    size: "L",
    condition: "Good",
    price: 1500,
    image: IMAGES.hoodie,
  },
  // Marketplace — Jordan
  {
    seller: "Jordan",
    type: "marketplace",
    status: "verified",
    title: "Leather biker jacket",
    description: "Faux leather, warm lining. Selling because size is tight.",
    category: "Outerwear",
    size: "L",
    condition: "Good",
    price: 4500,
    image: IMAGES.jacket,
  },
  {
    seller: "Jordan",
    type: "marketplace",
    status: "verified",
    title: "Running sneakers",
    description: "Used for light runs. Clean soles, still springy.",
    category: "Shoes",
    size: "L",
    condition: "Good",
    price: 3200,
    image: IMAGES.sneakers,
  },
  {
    seller: "Jordan",
    type: "marketplace",
    status: "verified",
    title: "Pleated midi skirt",
    description: "School + weekend friendly. Elastic waist.",
    category: "Bottoms",
    size: "S",
    condition: "Like new",
    price: 1200,
    image: IMAGES.skirt,
  },
  {
    seller: "Jordan",
    type: "marketplace",
    status: "verified",
    title: "Cargo pants",
    description: "Olive green cargos with lots of pockets.",
    category: "Bottoms",
    size: "M",
    condition: "Good",
    price: 1600,
    image: IMAGES.pants,
  },
  {
    seller: "Jordan",
    type: "marketplace",
    status: "verified",
    title: "Crossbody bag",
    description: "Everyday bag, zipper works. Interior clean.",
    category: "Accessories",
    size: "One size",
    condition: "Good",
    price: 900,
    image: IMAGES.bag,
  },
  {
    seller: "Jordan",
    type: "marketplace",
    status: "verified",
    title: "Flannel shirt",
    description: "Warm check flannel. Softened from washes.",
    category: "Tops",
    size: "L",
    condition: "Good",
    price: 1100,
    image: IMAGES.shirt,
  },
  // Marketplace — Sam
  {
    seller: "Sam",
    type: "marketplace",
    status: "verified",
    title: "Wool coat",
    description: "Heavy winter coat. Kept in a garment bag.",
    category: "Outerwear",
    size: "M",
    condition: "Like new",
    price: 5500,
    image: IMAGES.coat,
  },
  {
    seller: "Sam",
    type: "marketplace",
    status: "verified",
    title: "Knit sweater",
    description: "Cream knit, no pills. Hand-washed only.",
    category: "Tops",
    size: "M",
    condition: "Like new",
    price: 1900,
    image: IMAGES.sweater,
  },
  {
    seller: "Sam",
    type: "marketplace",
    status: "verified",
    title: "Denim shorts",
    description: "High-waist shorts for summer hikes.",
    category: "Bottoms",
    size: "S",
    condition: "Good",
    price: 700,
    image: IMAGES.shorts,
  },
  // Donations — Sam / Maya / Jordan
  {
    seller: "Sam",
    type: "donation",
    status: "verified",
    title: "Cozy sweater (free)",
    description: "Free to a good home. Soft and warm for winter.",
    category: "Tops",
    size: "M",
    condition: "Good",
    price: null,
    image: IMAGES.sweater,
  },
  {
    seller: "Sam",
    type: "donation",
    status: "verified",
    title: "Kids jacket",
    description: "Outgrown kids jacket. Cleaned and ready to donate.",
    category: "Outerwear",
    size: "S",
    condition: "Good",
    price: null,
    image: IMAGES.kids,
  },
  {
    seller: "Maya",
    type: "donation",
    status: "verified",
    title: "Winter scarf set",
    description: "Two scarves bundled free. Pick up in Thimphu.",
    category: "Accessories",
    size: "One size",
    condition: "Like new",
    price: null,
    image: IMAGES.scarf,
  },
  {
    seller: "Maya",
    type: "donation",
    status: "verified",
    title: "School shirt (free)",
    description: "White school shirt, gently used. Free for anyone who needs it.",
    category: "Tops",
    size: "S",
    condition: "Fair",
    price: null,
    image: IMAGES.shirt,
  },
  {
    seller: "Jordan",
    type: "donation",
    status: "verified",
    title: "Warm hoodie donate",
    description: "Donating instead of selling — prefer it goes to someone local.",
    category: "Tops",
    size: "L",
    condition: "Good",
    price: null,
    image: IMAGES.hoodie,
  },
  {
    seller: "Jordan",
    type: "donation",
    status: "verified",
    title: "Sneakers to give away",
    description: "Still wearable. Free pickup in Paro.",
    category: "Shoes",
    size: "M",
    condition: "Fair",
    price: null,
    image: IMAGES.sneakers,
  },
  {
    seller: "Sam",
    type: "donation",
    status: "pending",
    title: "Coat donation (pending)",
    description: "Waiting on photo verification before it goes live.",
    category: "Outerwear",
    size: "L",
    condition: "Good",
    price: null,
    image: IMAGES.coat,
  },
];

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

async function upsertListing(
  pg: Client,
  sellerId: string,
  item: SeedListing,
) {
  // Replace prior seed row with same seller + title so re-runs stay clean
  await pg.query(
    `delete from public.listings where seller_id = $1 and title = $2`,
    [sellerId, item.title],
  );

  const { rows } = await pg.query(
    `insert into public.listings
      (seller_id, type, title, description, category, size, condition,
       price_cents, currency, status, verified_at, verified_by)
     values (
       $1::uuid, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text,
       $8::integer, 'BTN', $9::text,
       case when $9::text = 'verified' then now() else null end,
       case when $9::text = 'verified' then $1::uuid else null end
     )
     returning id`,
    [
      sellerId,
      item.type,
      item.title,
      item.description,
      item.category,
      item.size,
      item.condition,
      item.price,
      item.status,
    ],
  );
  const listingId = rows[0].id as string;

  for (const [i, angle] of ["front", "back", "tag", "defect"].entries()) {
    await pg.query(
      `insert into public.listing_photos (listing_id, angle, storage_path, public_url, sort_order)
       values ($1, $2, $3, $4, $5)`,
      [
        listingId,
        angle,
        `seed/${listingId}/${angle}`,
        item.image,
        i,
      ],
    );
  }

  return listingId;
}

async function main() {
  if (!dbUrl) throw new Error("DATABASE_URL required");
  const pg = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  await pg.query(`create extension if not exists pgcrypto`);

  // Platform defaults
  await pg.query(
    `insert into public.app_config (key, value)
     values ('currency', '"BTN"'::jsonb),
            ('platform_fee_percent', '5'::jsonb)
     on conflict (key) do update set value = excluded.value`,
  );

  const ids: Record<string, string> = {};
  for (const u of users) {
    const id = await ensureUser(pg, u);
    ids[u.display_name] = id;
    await pg.query(
      `insert into public.profiles (id, display_name, area, role, can_approve)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update
         set display_name = excluded.display_name,
             area = excluded.area,
             role = excluded.role,
             can_approve = excluded.can_approve`,
      [id, u.display_name, u.area, u.role, u.role === "admin"],
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

  let market = 0;
  let donate = 0;
  let pending = 0;

  for (const item of CATALOG) {
    const sellerId = ids[item.seller];
    if (!sellerId) continue;
    const id = await upsertListing(pg, sellerId, item);
    if (item.status === "pending") pending += 1;
    else if (item.type === "marketplace") market += 1;
    else donate += 1;
    console.log(
      `${item.type}/${item.status}`,
      item.title,
      "→",
      id.slice(0, 8),
    );
  }

  const counts = await pg.query(
    `select type, status, count(*)::int as n
     from public.listings
     group by type, status
     order by type, status`,
  );
  console.log("\nLive listing counts:");
  console.table(counts.rows);
  console.log(
    `\nSeeded catalog: ${market} verified market, ${donate} verified donations, ${pending} pending`,
  );

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
