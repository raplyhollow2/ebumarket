export const DEFAULT_CURRENCY = "BTN";

/** BTN uses chetrum subunits (100 chetrum = 1 ngultrum), same pattern as cents. */
export function formatMoney(amountSubunits: number, currency = DEFAULT_CURRENCY) {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase();
  try {
    return new Intl.NumberFormat("en-BT", {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "BTN" ? 2 : 2,
    }).format(amountSubunits / 100);
  } catch {
    // Fallback if runtime lacks currency data
    return `Nu. ${(amountSubunits / 100).toFixed(2)}`;
  }
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
