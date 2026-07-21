import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { platformFeeCents } from "@/lib/format";

export async function POST(req: Request) {
  try {
    const { listingId } = (await req.json()) as { listingId?: string };
    if (!listingId) {
      return NextResponse.json({ error: "listingId required" }, { status: 400 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 501 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .eq("status", "verified")
      .eq("type", "marketplace")
      .single();
    if (error || !listing || listing.price_cents == null) {
      return NextResponse.json({ error: "Listing not available" }, { status: 404 });
    }

    const fee = platformFeeCents(listing.price_cents);
    const total = listing.price_cents + fee;

    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        payment_method: "online",
        item_price_cents: listing.price_cents,
        fee_cents: fee,
        total_cents: total,
        status: "awaiting_payment",
      })
      .select("id")
      .single();
    if (txErr || !tx) {
      return NextResponse.json({ error: txErr?.message ?? "tx failed" }, { status: 500 });
    }

    const stripe = new Stripe(secret);
    const origin = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/activity?paid=1`,
      cancel_url: `${origin}/market/${listing.id}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: (listing.currency || "btn").toLowerCase(),
            unit_amount: total,
            product_data: { name: listing.title },
          },
        },
      ],
      metadata: { transaction_id: tx.id, listing_id: listing.id },
    });

    await supabase
      .from("transactions")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", tx.id);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
