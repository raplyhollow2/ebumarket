import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Client } from "pg";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 501 });
  }

  const stripe = new Stripe(secret);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const txId = session.metadata?.transaction_id;
    if (txId && process.env.DATABASE_URL) {
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      try {
        // Buyer paid platform → fee retained; seller share becomes claimable
        await client.query(
          `update public.transactions
           set status = 'paid',
               payout_status = 'claimable',
               stripe_payment_intent_id = $2,
               updated_at = now()
           where id = $1`,
          [
            txId,
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          ],
        );
        if (session.metadata?.listing_id) {
          await client.query(
            `update public.listings set status = 'sold', updated_at = now() where id = $1`,
            [session.metadata.listing_id],
          );
        }
        await client.query(
          `insert into public.audit_events (actor_id, action, entity_type, entity_id, payload)
           values (null, 'payment_received', 'transaction', $1, $2::jsonb)`,
          [
            txId,
            JSON.stringify({
              fee_cents: session.metadata?.fee_cents ?? null,
              seller_payout_cents: session.metadata?.seller_payout_cents ?? null,
              seller_id: session.metadata?.seller_id ?? null,
              stripe_session_id: session.id,
            }),
          ],
        );
      } finally {
        await client.end();
      }
    }
  }

  return NextResponse.json({ received: true });
}
