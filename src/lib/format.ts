export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function platformFeeCents(
  itemPriceCents: number,
  percent = Number(process.env.PLATFORM_FEE_PERCENT ?? 5),
) {
  return Math.round((itemPriceCents * percent) / 100);
}

export function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pending Verification";
    case "verified":
      return "Verified by Zyra";
    case "rejected":
      return "Needs changes";
    case "sold":
      return "Sold";
    case "claimed":
      return "Claimed";
    case "closed":
      return "Closed";
    case "requested":
      return "Requested";
    case "awaiting_payment":
      return "Awaiting payment";
    case "paid":
      return "Paid";
    case "accepted":
      return "Accepted";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "approved":
      return "Approved";
    case "fulfilled":
      return "Fulfilled";
    case "declined":
      return "Declined";
    default:
      return status;
  }
}
