-- Split payment ledger: platform keeps fee, seller claimable payout
alter table public.transactions
  add column if not exists seller_payout_cents integer;

alter table public.transactions
  add column if not exists payout_status text not null default 'pending'
    check (payout_status in (
      'pending',
      'claimable',
      'claimed',
      'paid_out',
      'not_applicable'
    ));

alter table public.transactions
  add column if not exists payout_claimed_at timestamptz;

alter table public.transactions
  add column if not exists payout_paid_at timestamptz;

-- Backfill existing rows from fee split (buyer paid item + fee; seller share = item)
update public.transactions
set
  seller_payout_cents = coalesce(seller_payout_cents, item_price_cents),
  payout_status = case
    when payment_method = 'cod' and status in ('completed', 'cancelled') then 'not_applicable'
    when payment_method = 'cod' then 'not_applicable'
    when status = 'paid' and payout_status = 'pending' then 'claimable'
    when status in ('completed') and payment_method = 'online' then 'claimable'
    else payout_status
  end
where seller_payout_cents is null
   or payout_status = 'pending';

alter table public.transactions
  alter column seller_payout_cents set default 0;

update public.transactions
set seller_payout_cents = item_price_cents
where seller_payout_cents is null;

alter table public.transactions
  alter column seller_payout_cents set not null;

create index if not exists transactions_payout_status_idx
  on public.transactions (payout_status);
