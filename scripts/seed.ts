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
  /** donation_centers.slug — donations only */
  centerSlug?: string;
};

/** Distinct Bhutanese demo images for seed photos (served from /public/bhutan) */
const IMAGES = {
  denim: "/bhutan/listing-denim.webp",
  tee: "/bhutan/cat-tops.webp",
  hoodie: "/bhutan/listing-hoodie.webp",
  dress: "/bhutan/cat-dresses.webp",
  sneakers: "/bhutan/cat-shoes.webp",
  jacket: "/bhutan/cat-outerwear.webp",
  skirt: "/bhutan/cat-dresses.webp",
  sweater: "/bhutan/cat-tops.webp",
  pants: "/bhutan/cat-bottoms.webp",
  bag: "/bhutan/cat-accessories.webp",
  boots: "/bhutan/cat-shoes.webp",
  shirt: "/bhutan/cat-tops.webp",
  coat: "/bhutan/listing-coat.webp",
  shorts: "/bhutan/cat-bottoms.webp",
  scarf: "/bhutan/listing-scarf.webp",
  kids: "/bhutan/listing-kids.webp",
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
    centerSlug: "paro-youth-centre",
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
    centerSlug: "thimphu-childrens-home",
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
    centerSlug: "thimphu-childrens-home",
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
    centerSlug: "thimphu-childrens-home",
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
    centerSlug: "bhutan-youth-cso",
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
    centerSlug: "phuentsholing-shelter-hub",
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
  centerIdBySlug: Record<string, string>,
) {
  // Replace prior seed row with same seller + title so re-runs stay clean
  await pg.query(
    `delete from public.listings where seller_id = $1 and title = $2`,
    [sellerId, item.title],
  );

  const centerId =
    item.type === "donation" && item.centerSlug
      ? centerIdBySlug[item.centerSlug] ?? null
      : null;

  const { rows } = await pg.query(
    `insert into public.listings
      (seller_id, type, title, description, category, size, condition,
       price_cents, currency, status, verified_at, verified_by, center_id)
     values (
       $1::uuid, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text,
       $8::integer, 'BTN', $9::text,
       case when $9::text = 'verified' then now() else null end,
       case when $9::text = 'verified' then $1::uuid else null end,
       $10::uuid
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
      centerId,
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

  const centerRows = await pg.query(
    `select id, slug from public.donation_centers`,
  );
  const centerIdBySlug: Record<string, string> = {};
  for (const row of centerRows.rows) {
    centerIdBySlug[row.slug as string] = row.id as string;
  }
  console.log("centers", Object.keys(centerIdBySlug).length);

  // Staff: Sam owns Thimphu Children's Home; Jordan staff at Paro Youth
  if (ids.Sam && centerIdBySlug["thimphu-childrens-home"]) {
    await pg.query(
      `insert into public.center_members (center_id, user_id, member_role)
       values ($1, $2, 'owner')
       on conflict (center_id, user_id) do update set member_role = excluded.member_role`,
      [centerIdBySlug["thimphu-childrens-home"], ids.Sam],
    );
  }
  if (ids.Jordan && centerIdBySlug["paro-youth-centre"]) {
    await pg.query(
      `insert into public.center_members (center_id, user_id, member_role)
       values ($1, $2, 'staff')
       on conflict (center_id, user_id) do update set member_role = excluded.member_role`,
      [centerIdBySlug["paro-youth-centre"], ids.Jordan],
    );
  }

  // Sample Tumblr-like theme for Sam
  if (ids.Sam) {
    await pg.query(
      `insert into public.profile_themes (
         user_id, banner_url, avatar_url, bio, accent_color,
         background_style, layout_style, show_donation_stats, show_listings, custom_links
       ) values (
         $1,
         '/bhutan/profile-banner.webp',
         '/bhutan/profile-avatar.webp',
         'Giving clothes a second life in Phuentsholing — open to centre drives.',
         '#1c3024', 'soft_wash', 'classic', true, true,
         '[{"label":"Donation Hub","url":"/donate"}]'::jsonb
       )
       on conflict (user_id) do update set
         banner_url = excluded.banner_url,
         avatar_url = excluded.avatar_url,
         bio = excluded.bio,
         accent_color = excluded.accent_color,
         updated_at = now()`,
      [ids.Sam],
    );
  }

  // Keep centre covers on Bhutanese local assets
  const centerCovers: Record<string, string> = {
    "thimphu-childrens-home": "/bhutan/center-thimphu-home.webp",
    "paro-youth-centre": "/bhutan/center-paro-youth.webp",
    "phuentsholing-shelter-hub": "/bhutan/center-pl-shelter.webp",
    "bhutan-youth-cso": "/bhutan/center-cso.webp",
  };
  for (const [slug, cover] of Object.entries(centerCovers)) {
    await pg.query(
      `update public.donation_centers set cover_url = $2, updated_at = now() where slug = $1`,
      [slug, cover],
    );
  }

  let market = 0;
  let donate = 0;
  let pending = 0;
  let tagged = 0;

  for (const item of CATALOG) {
    const sellerId = ids[item.seller];
    if (!sellerId) continue;
    const id = await upsertListing(pg, sellerId, item, centerIdBySlug);
    if (item.status === "pending") pending += 1;
    else if (item.type === "marketplace") market += 1;
    else donate += 1;
    if (item.centerSlug) tagged += 1;
    console.log(
      `${item.type}/${item.status}`,
      item.title,
      item.centerSlug ? `@${item.centerSlug}` : "",
      "→",
      id.slice(0, 8),
    );
  }

  // Recompute donor tiers for all donation sellers
  for (const name of ["Maya", "Jordan", "Sam"] as const) {
    if (ids[name]) {
      await pg.query(`select public.recompute_donor_stats($1::uuid)`, [
        ids[name],
      ]);
    }
  }

  const counts = await pg.query(
    `select type, status, count(*)::int as n
     from public.listings
     group by type, status
     order by type, status`,
  );
  console.log("\nLive listing counts:");
  console.table(counts.rows);
  const stats = await pg.query(
    `select p.display_name, d.tier, d.points, d.items_donated, d.center_donations
     from public.donor_stats d
     join public.profiles p on p.id = d.user_id
     order by d.points desc`,
  );
  console.log("\nDonor stats:");
  console.table(stats.rows);
  console.log(
    `\nSeeded catalog: ${market} verified market, ${donate} verified donations (${tagged} centre-tagged), ${pending} pending`,
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
