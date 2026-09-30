-- Lets the billing page say "Pro until <date>" after someone cancels in the Customer Portal.
alter table public.profiles add column cancel_at_period_end boolean not null default false;
