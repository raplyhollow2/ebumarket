import { NextResponse } from "next/server";
import { Client } from "pg";

/**
 * MVP helper: mark a just-created email as confirmed so login works
 * when Supabase email confirmation is enabled.
 */
export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ ok: false, skipped: true });
    }

    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
      await client.query(
        `update auth.users
         set email_confirmed_at = coalesce(email_confirmed_at, now()),
             updated_at = now()
         where lower(email) = lower($1)`,
        [email.trim()],
      );
    } finally {
      await client.end();
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "confirm failed" },
      { status: 500 },
    );
  }
}
