-- ============================================
-- MOKO — Full database schema with RLS
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('ceo', 'manager', 'site_manager', 'site_worker')),
  avatar text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- PROJECTS
-- ============================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  location text,
  status text default 'active' check (status in ('active', 'completed', 'on_hold')),
  contract_value numeric not null default 0,
  contract_currency text default 'USD',
  start_date date,
  expected_end_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- PROJECT MEMBERS (manager assignments)
-- ============================================
create table public.project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  unique(project_id, user_id)
);

-- ============================================
-- SITES
-- ============================================
create table public.sites (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  location text,
  status text default 'active',
  created_at timestamptz default now()
);

-- ============================================
-- SITE MEMBERS (site manager + worker assignments)
-- ============================================
create table public.site_members (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references public.sites(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  unique(site_id, user_id)
);

-- ============================================
-- EXPENSE CATEGORIES
-- ============================================
create table public.expense_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean default true,
  is_recurring boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Insert default categories
insert into public.expense_categories (name, is_active, is_recurring) values
  ('Transport', true, false),
  ('Consumables', true, false),
  ('Equipment rent', true, false),
  ('Equipment maintenance', true, false),
  ('Vehicles', true, false),
  ('Personal', true, false),
  ('Other', true, false),
  ('Salary', true, true),
  ('House rent', true, true);

-- ============================================
-- BUDGET REQUESTS (site manager → manager)
-- ============================================
create table public.budget_requests (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references public.sites(id),
  requested_by uuid references public.profiles(id),
  reason text,
  total_requested numeric default 0,
  total_approved numeric,
  status text default 'pending' check (status in ('pending', 'approved', 'adjusted', 'rejected')),
  manager_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  ceo_alerted boolean default false,
  created_at timestamptz default now()
);

create table public.budget_request_items (
  id uuid primary key default uuid_generate_v4(),
  budget_request_id uuid references public.budget_requests(id) on delete cascade,
  category_id uuid references public.expense_categories(id),
  amount_requested numeric not null,
  amount_approved numeric,
  currency text default 'USD',
  status text default 'pending'
);

-- ============================================
-- WORKER FUND REQUESTS (worker → site manager)
-- ============================================
create table public.worker_fund_requests (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references public.sites(id),
  worker_id uuid references public.profiles(id),
  category_id uuid references public.expense_categories(id),
  amount_requested numeric not null,
  amount_approved numeric,
  currency text default 'USD',
  reason text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- EXPENSES
-- ============================================
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references public.sites(id),
  submitted_by uuid references public.profiles(id),
  category_id uuid references public.expense_categories(id),
  amount numeric not null,
  currency text default 'USD',
  amount_usd numeric,
  payment_method text check (payment_method in ('cash', 'card', 'eft')),
  description text,
  vendor text,
  receipt_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  submitted_at timestamptz default now()
);

-- ============================================
-- INCOME ENTRIES
-- ============================================
create table public.income_entries (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id),
  amount numeric not null,
  currency text default 'USD',
  date date not null,
  description text,
  status text default 'received' check (status in ('received', 'pending')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- RECURRING ALLOCATIONS
-- ============================================
create table public.recurring_allocations (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references public.sites(id),
  worker_id uuid references public.profiles(id),
  category_id uuid references public.expense_categories(id),
  amount numeric not null,
  currency text default 'USD',
  frequency text default 'monthly',
  status text default 'active' check (status in ('active', 'paused')),
  effective_from date default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  severity text default 'info' check (severity in ('info', 'warning', 'danger', 'success')),
  created_at timestamptz default now()
);

-- ============================================
-- INVITATIONS
-- ============================================
create table public.invitations (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  role text not null,
  site_id uuid references public.sites(id),
  project_id uuid references public.projects(id),
  invited_by uuid references public.profiles(id),
  status text default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.sites enable row level security;
alter table public.site_members enable row level security;
alter table public.expense_categories enable row level security;
alter table public.budget_requests enable row level security;
alter table public.budget_request_items enable row level security;
alter table public.worker_fund_requests enable row level security;
alter table public.expenses enable row level security;
alter table public.income_entries enable row level security;
alter table public.recurring_allocations enable row level security;
alter table public.notifications enable row level security;
alter table public.invitations enable row level security;

-- Helper function: get current user's role
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Helper function: get current user's site ids
create or replace function public.get_my_site_ids()
returns uuid[] as $$
  select array_agg(site_id) from public.site_members where user_id = auth.uid();
$$ language sql security definer stable;

-- Helper function: get current user's project ids
create or replace function public.get_my_project_ids()
returns uuid[] as $$
  select array_agg(project_id) from public.project_members where user_id = auth.uid();
$$ language sql security definer stable;

-- PROFILES policies
create policy "Users can read all profiles" on public.profiles
  for select using (auth.uid() is not null);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "CEO and manager can insert profiles" on public.profiles
  for insert with check (get_my_role() in ('ceo', 'manager'));

-- PROJECTS policies
create policy "Authenticated users can read projects" on public.projects
  for select using (auth.uid() is not null);

create policy "CEO can manage projects" on public.projects
  for all using (get_my_role() = 'ceo');

-- PROJECT MEMBERS policies
create policy "Authenticated can read project members" on public.project_members
  for select using (auth.uid() is not null);

create policy "CEO can manage project members" on public.project_members
  for all using (get_my_role() = 'ceo');

-- SITES policies
create policy "Authenticated users can read sites" on public.sites
  for select using (auth.uid() is not null);

create policy "CEO can manage sites" on public.sites
  for all using (get_my_role() = 'ceo');

-- SITE MEMBERS policies
create policy "Authenticated can read site members" on public.site_members
  for select using (auth.uid() is not null);

create policy "CEO and manager can manage site members" on public.site_members
  for all using (get_my_role() in ('ceo', 'manager'));

-- CATEGORIES policies
create policy "Authenticated can read categories" on public.expense_categories
  for select using (auth.uid() is not null);

create policy "CEO and manager can manage categories" on public.expense_categories
  for all using (get_my_role() in ('ceo', 'manager'));

-- BUDGET REQUESTS policies
create policy "CEO sees all budget requests" on public.budget_requests
  for select using (get_my_role() = 'ceo');

create policy "Manager sees requests for their projects" on public.budget_requests
  for select using (get_my_role() = 'manager');

create policy "Site manager sees own requests" on public.budget_requests
  for select using (
    get_my_role() = 'site_manager' and
    site_id = any(get_my_site_ids())
  );

create policy "Site manager can create requests" on public.budget_requests
  for insert with check (
    get_my_role() in ('site_manager') and
    requested_by = auth.uid()
  );

create policy "Manager can update budget requests" on public.budget_requests
  for update using (get_my_role() in ('ceo', 'manager'));

-- BUDGET REQUEST ITEMS policies
create policy "Read budget request items" on public.budget_request_items
  for select using (auth.uid() is not null);

create policy "Insert budget request items" on public.budget_request_items
  for insert with check (auth.uid() is not null);

create policy "Update budget request items" on public.budget_request_items
  for update using (get_my_role() in ('ceo', 'manager'));

-- WORKER FUND REQUESTS policies
create policy "CEO sees all fund requests" on public.worker_fund_requests
  for select using (get_my_role() = 'ceo');

create policy "Manager sees fund requests in their projects" on public.worker_fund_requests
  for select using (get_my_role() = 'manager');

create policy "Site manager sees requests for their site" on public.worker_fund_requests
  for select using (
    get_my_role() = 'site_manager' and
    site_id = any(get_my_site_ids())
  );

create policy "Worker sees own requests" on public.worker_fund_requests
  for select using (worker_id = auth.uid());

create policy "Worker can create fund requests" on public.worker_fund_requests
  for insert with check (
    get_my_role() = 'site_worker' and
    worker_id = auth.uid()
  );

create policy "Site manager can update fund requests" on public.worker_fund_requests
  for update using (
    get_my_role() in ('site_manager', 'manager', 'ceo') and
    site_id = any(get_my_site_ids())
  );

-- EXPENSES policies
create policy "CEO sees all expenses" on public.expenses
  for select using (get_my_role() = 'ceo');

create policy "Manager sees expenses in their projects" on public.expenses
  for select using (get_my_role() = 'manager');

create policy "Site manager sees site expenses" on public.expenses
  for select using (
    get_my_role() = 'site_manager' and
    site_id = any(get_my_site_ids())
  );

create policy "Worker sees own expenses" on public.expenses
  for select using (submitted_by = auth.uid());

create policy "Workers and site managers can submit expenses" on public.expenses
  for insert with check (
    get_my_role() in ('site_worker', 'site_manager') and
    submitted_by = auth.uid()
  );

create policy "Site manager and above can update expenses" on public.expenses
  for update using (get_my_role() in ('site_manager', 'manager', 'ceo'));

-- INCOME ENTRIES policies
create policy "CEO and manager can manage income" on public.income_entries
  for all using (get_my_role() in ('ceo', 'manager'));

-- RECURRING ALLOCATIONS policies
create policy "CEO sees all recurring" on public.recurring_allocations
  for select using (get_my_role() = 'ceo');

create policy "Manager sees recurring in their projects" on public.recurring_allocations
  for select using (get_my_role() in ('manager', 'site_manager'));

create policy "Worker sees own recurring" on public.recurring_allocations
  for select using (worker_id = auth.uid());

create policy "Manager and site manager can manage recurring" on public.recurring_allocations
  for all using (get_my_role() in ('ceo', 'manager', 'site_manager'));

-- NOTIFICATIONS policies
create policy "Users see own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "System can insert notifications" on public.notifications
  for insert with check (auth.uid() is not null);

create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());

-- INVITATIONS policies
create policy "CEO and manager can manage invitations" on public.invitations
  for all using (get_my_role() in ('ceo', 'manager'));

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'site_worker'),
    upper(substring(coalesce(new.raw_user_meta_data->>'name', new.email), 1, 2))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- DONE
-- ============================================
