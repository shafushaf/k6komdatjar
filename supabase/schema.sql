-- =====================================================================
-- AgriSupply: SCHEMA LENGKAP. Supabase > SQL Editor > New query > Run
-- Aman dijalankan ulang di project BARU. Di project yang sudah berisi
-- data, baris "drop schema" di bawah akan menghapus data AgriSupply.
-- =====================================================================
drop view if exists public.market_listings, public.public_profiles cascade;
drop table if exists public.activity_logs, public.complaints, public.notifications, public.cart_items,
  public.reviews, public.payments, public.shipments, public.store_order_items, public.store_orders,
  public.stock_movements, public.supplier_products, public.inventory_batches, public.purchase_orders,
  public.harvest_offers, public.categories, public.settings, public.profiles cascade;

-- ---------- Tabel ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('farmer','supplier','store','admin')),
  full_name text not null, business_name text, phone text, address text, location text,
  is_active boolean not null default true, is_verified boolean not null default false,
  created_at timestamptz not null default now());

create or replace function public.my_role() returns text language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() and is_active $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() = 'admin', false) $$;
create or replace function public.am_verified() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and is_active and is_verified) $$;

create table public.settings (key text primary key, value text not null);
insert into public.settings values ('platform_fee_percent', '2');

create table public.categories (id serial primary key, name text unique not null);
insert into public.categories (name) values ('Sayuran'),('Buah-buahan'),('Beras dan Padi'),('Jagung'),('Rempah-rempah'),('Hasil Perkebunan'),('Komoditas Lainnya');

create table public.harvest_offers (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  category_id int references public.categories(id) on delete set null,
  commodity text not null, photo_path text,
  qty_kg numeric(12,2) not null check (qty_kg > 0),
  remaining_kg numeric(12,2) not null check (remaining_kg >= 0),
  price_per_kg numeric(12,2) not null check (price_per_kg > 0),
  harvest_date date not null, grade text not null check (grade in ('A','B','C')),
  location text not null, status text not null default 'active' check (status in ('active','closed')),
  created_at timestamptz not null default now());

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(), code text unique not null,
  supplier_id uuid not null references public.profiles(id), farmer_id uuid not null references public.profiles(id),
  offer_id uuid not null references public.harvest_offers(id), commodity text not null,
  qty_kg numeric(12,2) not null check (qty_kg > 0), price_per_kg numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','completed','rejected','cancelled')),
  actual_kg numeric(12,2), actual_grade text check (actual_grade in ('A','B','C')), storage_location text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.inventory_batches (
  id uuid primary key default gen_random_uuid(), lot_code text unique not null,
  supplier_id uuid not null references public.profiles(id), farmer_id uuid not null references public.profiles(id),
  purchase_order_id uuid unique references public.purchase_orders(id),
  category_id int references public.categories(id) on delete set null,
  commodity text not null, grade text not null, photo_path text, harvest_date date,
  cost_per_kg numeric(12,2) not null, received_kg numeric(12,2) not null,
  on_hand_kg numeric(12,2) not null check (on_hand_kg >= 0),
  reserved_kg numeric(12,2) not null default 0 check (reserved_kg >= 0),
  storage_location text, received_at timestamptz not null default now(),
  check (reserved_kg <= on_hand_kg));

create table public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profiles(id) on delete cascade,
  batch_id uuid not null unique references public.inventory_batches(id) on delete cascade,
  price_per_kg numeric(12,2) not null check (price_per_kg > 0),
  is_listed boolean not null default true, updated_at timestamptz not null default now());

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.inventory_batches(id) on delete cascade,
  supplier_id uuid not null references public.profiles(id),
  type text not null check (type in ('in','reserve','release','out')),
  qty_kg numeric(12,2) not null, ref text, note text, created_at timestamptz not null default now());

create table public.store_orders (
  id uuid primary key default gen_random_uuid(), code text unique not null,
  store_id uuid not null references public.profiles(id), supplier_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending','awaiting_payment','paid','processing','shipped','completed','rejected','cancelled')),
  subtotal numeric(14,2) not null default 0, shipping_fee numeric(14,2) not null default 0,
  platform_fee numeric(14,2) not null default 0, total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  batch_id uuid not null references public.inventory_batches(id),
  commodity text not null, grade text, qty_kg numeric(12,2) not null check (qty_kg > 0),
  price_per_kg numeric(12,2) not null, cost_per_kg numeric(12,2) not null);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.store_orders(id) on delete cascade,
  recipient_name text not null, phone text not null, address text not null,
  shipping_fee numeric(14,2) not null default 0, courier text, tracking_no text,
  status text not null default 'preparing' check (status in ('preparing','shipped','delivered')),
  updated_at timestamptz not null default now());

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('purchase','store')), ref_id uuid not null,
  payer_id uuid not null references public.profiles(id), payee_id uuid not null references public.profiles(id),
  amount numeric(14,2) not null check (amount > 0), method text not null check (method in ('transfer_bank','manual')),
  proof_path text, status text not null default 'awaiting_verification' check (status in ('awaiting_verification','verified','rejected')),
  created_at timestamptz not null default now(), verified_at timestamptz);

create table public.reviews (
  id uuid primary key default gen_random_uuid(), order_id uuid unique not null references public.store_orders(id) on delete cascade,
  store_id uuid not null references public.profiles(id), supplier_id uuid not null references public.profiles(id),
  rating int not null check (rating between 1 and 5), comment text, created_at timestamptz not null default now());

create table public.cart_items (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.supplier_products(id) on delete cascade,
  qty_kg numeric(12,2) not null check (qty_kg > 0), unique (store_id, listing_id));

create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, body text, link text, is_read boolean not null default false, created_at timestamptz not null default now());

create table public.complaints (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  ref_code text, subject text not null, body text not null,
  status text not null default 'open' check (status in ('open','resolved')), response text, created_at timestamptz not null default now());

create table public.activity_logs (
  id bigserial primary key, user_id uuid, action text not null, detail text, created_at timestamptz not null default now());

create index on public.harvest_offers (status, created_at desc);
create index on public.purchase_orders (supplier_id, status);
create index on public.purchase_orders (farmer_id, status);
create index on public.store_orders (store_id, status);
create index on public.store_orders (supplier_id, status);
create index on public.stock_movements (batch_id, created_at desc);
create index on public.notifications (user_id, is_read, created_at desc);

-- ---------- Trigger profil ----------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare r text := coalesce(new.raw_user_meta_data->>'role', 'store');
begin
  if r not in ('farmer','supplier','store') then r := 'store'; end if;  -- admin TIDAK bisa dibuat lewat pendaftaran
  insert into public.profiles (id, role, full_name, business_name, phone, address, location)
  values (new.id, r, coalesce(nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)),
    nullif(new.raw_user_meta_data->>'business_name',''), new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address', new.raw_user_meta_data->>'location');
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.protect_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role <> old.role or new.is_active <> old.is_active or new.is_verified <> old.is_verified then
      raise exception 'Peran dan status akun hanya dapat diubah admin';
    end if;
  end if;
  return new;
end $$;
create trigger protect_profile_cols before update on public.profiles for each row execute function public.protect_profile();

-- ---------- View aman ----------
create view public.public_profiles as
  select id, role, full_name, business_name, location, is_verified from public.profiles where is_active and public.my_role() is not null;
create view public.market_listings as
  select sp.id, sp.supplier_id, sp.batch_id, sp.price_per_kg, b.commodity, b.category_id, b.grade, b.photo_path, b.harvest_date,
         b.lot_code, (b.on_hand_kg - b.reserved_kg) as available_kg, coalesce(p.business_name, p.full_name) as supplier_name, p.location
  from public.supplier_products sp join public.inventory_batches b on b.id = sp.batch_id join public.profiles p on p.id = sp.supplier_id
  where sp.is_listed and p.is_active and (b.on_hand_kg - b.reserved_kg) > 0 and public.my_role() is not null;
revoke all on public.public_profiles, public.market_listings from anon;
grant select on public.public_profiles, public.market_listings to authenticated;

-- ---------- RLS ----------
do $$ declare t text; begin
  foreach t in array array['profiles','categories','settings','harvest_offers','purchase_orders','inventory_batches','supplier_products',
    'stock_movements','store_orders','store_order_items','shipments','payments','reviews','cart_items','notifications','complaints','activity_logs'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
  foreach t in array array['profiles','harvest_offers','purchase_orders','inventory_batches','supplier_products','stock_movements','store_orders',
    'store_order_items','shipments','payments','reviews','complaints','activity_logs','notifications'] loop
    execute format('create policy "admin baca %1$s" on public.%1$I for select using (public.is_admin())', t);
  end loop;
end $$;

create policy "profil sendiri" on public.profiles for select using (id = auth.uid());
create policy "ubah profil sendiri" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admin ubah profil" on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "kategori publik" on public.categories for select using (true);
create policy "admin kelola kategori" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "pengaturan dibaca" on public.settings for select using (public.my_role() is not null);
create policy "admin ubah pengaturan" on public.settings for update using (public.is_admin()) with check (public.is_admin());

create policy "penawaran dibaca" on public.harvest_offers for select using (farmer_id = auth.uid() or public.my_role() = 'supplier');
create policy "petani buat penawaran" on public.harvest_offers for insert
  with check (farmer_id = auth.uid() and public.my_role() = 'farmer' and public.am_verified() and remaining_kg = qty_kg and status = 'active');
create policy "petani hapus penawaran" on public.harvest_offers for delete using (farmer_id = auth.uid());

create policy "po pihak terkait" on public.purchase_orders for select using (supplier_id = auth.uid() or farmer_id = auth.uid());
create policy "batch milik supplier" on public.inventory_batches for select using (supplier_id = auth.uid());
create policy "produk milik supplier" on public.supplier_products for select using (supplier_id = auth.uid());
create policy "mutasi milik supplier" on public.stock_movements for select using (supplier_id = auth.uid());
create policy "pesanan pihak terkait" on public.store_orders for select using (store_id = auth.uid() or supplier_id = auth.uid());
create policy "item pihak terkait" on public.store_order_items for select
  using (exists (select 1 from public.store_orders o where o.id = order_id and (o.store_id = auth.uid() or o.supplier_id = auth.uid())));
create policy "pengiriman pihak terkait" on public.shipments for select
  using (exists (select 1 from public.store_orders o where o.id = order_id and (o.store_id = auth.uid() or o.supplier_id = auth.uid())));
create policy "pembayaran pihak terkait" on public.payments for select using (payer_id = auth.uid() or payee_id = auth.uid());
create policy "ulasan dibaca" on public.reviews for select using (public.my_role() is not null);
create policy "keranjang sendiri" on public.cart_items for all
  using (store_id = auth.uid() and public.my_role() = 'store') with check (store_id = auth.uid() and public.my_role() = 'store');
create policy "notifikasi sendiri" on public.notifications for select using (user_id = auth.uid());
create policy "tandai notifikasi" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "pengaduan sendiri" on public.complaints for select using (user_id = auth.uid());
create policy "buat pengaduan" on public.complaints for insert with check (user_id = auth.uid() and public.my_role() is not null);
create policy "admin tanggapi pengaduan" on public.complaints for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Fungsi bantu (tidak bisa dipanggil langsung dari browser) ----------
create or replace function public._code(p text) returns text language sql as
$$ select p || '-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5)) $$;
create or replace function public._notify(p_user uuid, p_title text, p_body text, p_link text) returns void
language sql security definer set search_path = public as $$ insert into public.notifications (user_id, title, body, link) values (p_user, p_title, p_body, p_link) $$;
create or replace function public._log(p_action text, p_detail text) returns void
language sql security definer set search_path = public as $$ insert into public.activity_logs (user_id, action, detail) values (auth.uid(), p_action, p_detail) $$;
create or replace function public._need(p_role text, p_verified boolean default true) returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(public.my_role(), '') <> p_role then raise exception 'Akses ditolak untuk peran ini'; end if;
  if p_verified and not public.am_verified() then raise exception 'Akun Anda belum diverifikasi admin'; end if;
end $$;
create or replace function public._release(p_order uuid) returns void language plpgsql security definer set search_path = public as $$
declare i record;
begin
  for i in select * from public.store_order_items where order_id = p_order loop
    update public.inventory_batches set reserved_kg = greatest(reserved_kg - i.qty_kg, 0) where id = i.batch_id;
    insert into public.stock_movements (batch_id, supplier_id, type, qty_kg, ref, note)
    select i.batch_id, supplier_id, 'release', i.qty_kg, 'order:' || p_order, 'Reservasi dilepas' from public.inventory_batches where id = i.batch_id;
  end loop;
end $$;
revoke execute on function public._code(text), public._notify(uuid,text,text,text), public._log(text,text), public._need(text,boolean), public._release(uuid) from public, anon, authenticated;

-- ---------- RPC: Petani -> Supplier ----------
create or replace function public.close_offer(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._need('farmer');
  update public.harvest_offers set status = 'closed' where id = p_id and farmer_id = auth.uid();
end $$;

create or replace function public.place_purchase_order(p_offer uuid, p_qty numeric) returns uuid language plpgsql security definer set search_path = public as $$
declare o public.harvest_offers; v_id uuid;
begin
  perform public._need('supplier');
  if p_qty is null or p_qty <= 0 then raise exception 'Jumlah harus lebih dari 0'; end if;
  select * into o from public.harvest_offers where id = p_offer for update;
  if not found or o.status <> 'active' then raise exception 'Penawaran tidak tersedia'; end if;
  if p_qty > o.remaining_kg then raise exception 'Jumlah melebihi sisa penawaran (% kg)', o.remaining_kg; end if;
  update public.harvest_offers set remaining_kg = remaining_kg - p_qty where id = o.id;
  insert into public.purchase_orders (code, supplier_id, farmer_id, offer_id, commodity, qty_kg, price_per_kg)
  values (public._code('PO'), auth.uid(), o.farmer_id, o.id, o.commodity, p_qty, o.price_per_kg) returning id into v_id;
  perform public._notify(o.farmer_id, 'Pesanan baru', 'Ada pesanan ' || p_qty || ' kg ' || o.commodity, '/pesanan-masuk');
  perform public._log('po_dibuat', v_id::text);
  return v_id;
end $$;

create or replace function public.farmer_respond_po(p_id uuid, p_accept boolean) returns void language plpgsql security definer set search_path = public as $$
declare po public.purchase_orders;
begin
  perform public._need('farmer');
  select * into po from public.purchase_orders where id = p_id and farmer_id = auth.uid() for update;
  if not found then raise exception 'Pesanan tidak ditemukan'; end if;
  if po.status <> 'pending' then raise exception 'Pesanan sudah diproses'; end if;
  if p_accept then
    update public.purchase_orders set status = 'confirmed', updated_at = now() where id = p_id;
  else
    update public.purchase_orders set status = 'rejected', updated_at = now() where id = p_id;
    update public.harvest_offers set remaining_kg = remaining_kg + po.qty_kg where id = po.offer_id;
  end if;
  perform public._notify(po.supplier_id, case when p_accept then 'Pesanan diterima petani' else 'Pesanan ditolak petani' end, po.code, '/pembelian');
  perform public._log('po_respon', po.code || ':' || p_accept);
end $$;

create or replace function public.farmer_ship_po(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare po public.purchase_orders;
begin
  perform public._need('farmer');
  select * into po from public.purchase_orders where id = p_id and farmer_id = auth.uid() for update;
  if not found or po.status <> 'confirmed' then raise exception 'Pesanan belum bisa dikirim'; end if;
  update public.purchase_orders set status = 'shipped', updated_at = now() where id = p_id;
  perform public._notify(po.supplier_id, 'Hasil panen dikirim', po.code, '/pembelian');
end $$;

create or replace function public.supplier_receive_po(p_id uuid, p_actual numeric, p_grade text, p_storage text) returns void language plpgsql security definer set search_path = public as $$
declare po public.purchase_orders;
begin
  perform public._need('supplier');
  if p_actual is null or p_actual <= 0 then raise exception 'Berat aktual harus lebih dari 0'; end if;
  if p_grade not in ('A','B','C') then raise exception 'Grade tidak valid'; end if;
  select * into po from public.purchase_orders where id = p_id and supplier_id = auth.uid() for update;
  if not found or po.status <> 'shipped' then raise exception 'Barang belum dalam status dikirim'; end if;
  update public.purchase_orders set status = 'delivered', actual_kg = p_actual, actual_grade = p_grade,
    storage_location = nullif(trim(p_storage), ''), updated_at = now() where id = p_id;
  perform public._notify(po.farmer_id, 'Hasil pemeriksaan menunggu persetujuan', po.code || ': ' || p_actual || ' kg, grade ' || p_grade, '/pesanan-masuk');
end $$;

create or replace function public.farmer_approve_po(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare po public.purchase_orders; o public.harvest_offers; v_batch uuid;
begin
  perform public._need('farmer');
  select * into po from public.purchase_orders where id = p_id and farmer_id = auth.uid() for update;
  if not found or po.status <> 'delivered' then raise exception 'Belum ada hasil pemeriksaan untuk disetujui'; end if;
  select * into o from public.harvest_offers where id = po.offer_id;
  update public.purchase_orders set status = 'completed', updated_at = now() where id = p_id;
  insert into public.inventory_batches (lot_code, supplier_id, farmer_id, purchase_order_id, category_id, commodity, grade, photo_path, harvest_date,
    cost_per_kg, received_kg, on_hand_kg, storage_location)
  values (public._code('LOT'), po.supplier_id, po.farmer_id, po.id, o.category_id, po.commodity, po.actual_grade, o.photo_path, o.harvest_date,
    po.price_per_kg, po.actual_kg, po.actual_kg, po.storage_location) returning id into v_batch;
  insert into public.stock_movements (batch_id, supplier_id, type, qty_kg, ref, note)
  values (v_batch, po.supplier_id, 'in', po.actual_kg, 'po:' || po.code, 'Barang masuk dari petani');
  perform public._notify(po.supplier_id, 'Stok bertambah', po.actual_kg || ' kg ' || po.commodity || ' masuk gudang', '/gudang');
  perform public._log('po_selesai', po.code);
end $$;

-- ---------- RPC: Pembayaran ----------
create or replace function public.record_payment(p_kind text, p_ref uuid, p_amount numeric, p_method text, p_proof text) returns void language plpgsql security definer set search_path = public as $$
declare so public.store_orders; po public.purchase_orders; v_payee uuid; v_code text;
begin
  if p_proof is not null and p_proof not like auth.uid()::text || '/%' then raise exception 'Bukti pembayaran tidak valid'; end if;
  if p_method not in ('transfer_bank','manual') then raise exception 'Metode pembayaran tidak valid'; end if;
  if p_kind = 'store' then
    perform public._need('store');
    select * into so from public.store_orders where id = p_ref and store_id = auth.uid();
    if not found or so.status <> 'awaiting_payment' then raise exception 'Pesanan belum menunggu pembayaran'; end if;
    if p_amount <> so.total then raise exception 'Nominal harus sama dengan total pesanan'; end if;
    v_payee := so.supplier_id; v_code := so.code;
  elsif p_kind = 'purchase' then
    perform public._need('supplier');
    select * into po from public.purchase_orders where id = p_ref and supplier_id = auth.uid();
    if not found or po.status not in ('confirmed','shipped','delivered','completed') then raise exception 'Pesanan belum dapat dibayar'; end if;
    if p_amount <= 0 then raise exception 'Nominal tidak valid'; end if;
    v_payee := po.farmer_id; v_code := po.code;
  else raise exception 'Jenis pembayaran tidak valid'; end if;
  if exists (select 1 from public.payments where kind = p_kind and ref_id = p_ref and status in ('awaiting_verification','verified')) then
    raise exception 'Pembayaran sudah dicatat dan menunggu/sudah diverifikasi';
  end if;
  insert into public.payments (kind, ref_id, payer_id, payee_id, amount, method, proof_path) values (p_kind, p_ref, auth.uid(), v_payee, p_amount, p_method, p_proof);
  insert into public.notifications (user_id, title, body, link)
  select id, 'Pembayaran menunggu verifikasi', v_code, '/admin/transaksi' from public.profiles where role = 'admin';
  perform public._log('bayar_dicatat', v_code);
end $$;

create or replace function public.verify_payment(p_id uuid, p_ok boolean) returns void language plpgsql security definer set search_path = public as $$
declare pay public.payments;
begin
  perform public._need('admin', false);
  select * into pay from public.payments where id = p_id for update;
  if not found or pay.status <> 'awaiting_verification' then raise exception 'Pembayaran tidak dapat diverifikasi'; end if;
  update public.payments set status = case when p_ok then 'verified' else 'rejected' end, verified_at = now() where id = p_id;
  if p_ok and pay.kind = 'store' then
    update public.store_orders set status = 'paid', updated_at = now() where id = pay.ref_id and status = 'awaiting_payment';
    perform public._notify(pay.payee_id, 'Pembayaran terverifikasi', 'Pesanan siap diproses', '/penjualan');
  end if;
  if p_ok and pay.kind = 'purchase' then perform public._notify(pay.payee_id, 'Pembayaran dari supplier terverifikasi', 'Dana sudah dicatat', '/pesanan-masuk'); end if;
  perform public._notify(pay.payer_id, case when p_ok then 'Pembayaran terverifikasi' else 'Pembayaran ditolak, silakan kirim ulang' end, null, '/dashboard');
  perform public._log('bayar_verifikasi', pay.id::text || ':' || p_ok);
end $$;

-- ---------- RPC: Supplier -> Toko ----------
create or replace function public.upsert_listing(p_batch uuid, p_price numeric, p_listed boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._need('supplier');
  if p_price is null or p_price <= 0 then raise exception 'Harga harus lebih dari 0'; end if;
  if not exists (select 1 from public.inventory_batches where id = p_batch and supplier_id = auth.uid()) then raise exception 'Batch bukan milik Anda'; end if;
  insert into public.supplier_products (supplier_id, batch_id, price_per_kg, is_listed) values (auth.uid(), p_batch, p_price, p_listed)
  on conflict (batch_id) do update set price_per_kg = excluded.price_per_kg, is_listed = excluded.is_listed, updated_at = now();
end $$;

create or replace function public.checkout(p_name text, p_phone text, p_address text) returns int language plpgsql security definer set search_path = public as $$
declare r record; l record; b public.inventory_batches; v_so uuid; v_sub numeric; v_fee numeric; v_pct numeric; v_n int := 0;
begin
  perform public._need('store');
  if coalesce(trim(p_name),'') = '' or coalesce(trim(p_phone),'') = '' or coalesce(trim(p_address),'') = '' then raise exception 'Nama, telepon, dan alamat penerima wajib diisi'; end if;
  if not exists (select 1 from public.cart_items where store_id = auth.uid()) then raise exception 'Keranjang kosong'; end if;
  select coalesce(value::numeric, 0) into v_pct from public.settings where key = 'platform_fee_percent';
  for r in select distinct sp.supplier_id from public.cart_items c join public.supplier_products sp on sp.id = c.listing_id where c.store_id = auth.uid() loop
    insert into public.store_orders (code, store_id, supplier_id) values (public._code('SO'), auth.uid(), r.supplier_id) returning id into v_so;
    v_sub := 0;
    for l in select c.qty_kg as qty, sp.batch_id, sp.price_per_kg as price, sp.is_listed from public.cart_items c
             join public.supplier_products sp on sp.id = c.listing_id where c.store_id = auth.uid() and sp.supplier_id = r.supplier_id loop
      select * into b from public.inventory_batches where id = l.batch_id for update;
      if not l.is_listed then raise exception 'Produk % tidak lagi dijual', b.commodity; end if;
      if l.qty > b.on_hand_kg - b.reserved_kg then raise exception 'Stok % tidak cukup (tersedia % kg)', b.commodity, b.on_hand_kg - b.reserved_kg; end if;
      update public.inventory_batches set reserved_kg = reserved_kg + l.qty where id = b.id;
      insert into public.stock_movements (batch_id, supplier_id, type, qty_kg, ref, note) values (b.id, b.supplier_id, 'reserve', l.qty, 'order:' || v_so, 'Reservasi checkout');
      insert into public.store_order_items (order_id, batch_id, commodity, grade, qty_kg, price_per_kg, cost_per_kg) values (v_so, b.id, b.commodity, b.grade, l.qty, l.price, b.cost_per_kg);
      v_sub := v_sub + l.qty * l.price;
    end loop;
    v_fee := round(v_sub * coalesce(v_pct, 0) / 100, 2);
    update public.store_orders set subtotal = v_sub, platform_fee = v_fee, total = v_sub + v_fee where id = v_so;
    insert into public.shipments (order_id, recipient_name, phone, address) values (v_so, trim(p_name), trim(p_phone), trim(p_address));
    perform public._notify(r.supplier_id, 'Pesanan toko baru', 'Total Rp ' || (v_sub + v_fee), '/penjualan');
    v_n := v_n + 1;
  end loop;
  delete from public.cart_items where store_id = auth.uid();
  perform public._log('checkout', v_n || ' pesanan');
  return v_n;
end $$;

create or replace function public.supplier_respond_order(p_id uuid, p_accept boolean, p_ship_fee numeric default 0) returns void language plpgsql security definer set search_path = public as $$
declare so public.store_orders;
begin
  perform public._need('supplier');
  select * into so from public.store_orders where id = p_id and supplier_id = auth.uid() for update;
  if not found or so.status <> 'pending' then raise exception 'Pesanan tidak dapat dikonfirmasi'; end if;
  if p_accept then
    if coalesce(p_ship_fee, 0) < 0 then raise exception 'Ongkos kirim tidak valid'; end if;
    update public.store_orders set status = 'awaiting_payment', shipping_fee = coalesce(p_ship_fee, 0), total = subtotal + platform_fee + coalesce(p_ship_fee, 0), updated_at = now() where id = p_id;
    update public.shipments set shipping_fee = coalesce(p_ship_fee, 0), updated_at = now() where order_id = p_id;
  else
    perform public._release(p_id);
    update public.store_orders set status = 'rejected', updated_at = now() where id = p_id;
  end if;
  perform public._notify(so.store_id, case when p_accept then 'Pesanan dikonfirmasi, silakan bayar' else 'Pesanan ditolak supplier' end, so.code, '/pesanan');
end $$;

create or replace function public.store_cancel_order(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare so public.store_orders;
begin
  perform public._need('store');
  select * into so from public.store_orders where id = p_id and store_id = auth.uid() for update;
  if not found or so.status not in ('pending','awaiting_payment') then raise exception 'Pesanan tidak dapat dibatalkan'; end if;
  if exists (select 1 from public.payments where kind = 'store' and ref_id = p_id and status in ('awaiting_verification','verified')) then
    raise exception 'Pembayaran sudah dikirim, hubungi admin untuk pembatalan';
  end if;
  perform public._release(p_id);
  update public.store_orders set status = 'cancelled', updated_at = now() where id = p_id;
  perform public._notify(so.supplier_id, 'Pesanan dibatalkan toko', so.code, '/penjualan');
end $$;

create or replace function public.supplier_process_order(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare so public.store_orders;
begin
  perform public._need('supplier');
  select * into so from public.store_orders where id = p_id and supplier_id = auth.uid() for update;
  if not found or so.status <> 'paid' then raise exception 'Pesanan belum dibayar/terverifikasi'; end if;
  update public.store_orders set status = 'processing', updated_at = now() where id = p_id;
  perform public._notify(so.store_id, 'Pesanan sedang diproses', so.code, '/pesanan');
end $$;

create or replace function public.supplier_ship_order(p_id uuid, p_courier text, p_tracking text) returns void language plpgsql security definer set search_path = public as $$
declare so public.store_orders; i record; b public.inventory_batches;
begin
  perform public._need('supplier');
  select * into so from public.store_orders where id = p_id and supplier_id = auth.uid() for update;
  if not found or so.status <> 'processing' then raise exception 'Pesanan belum berstatus diproses'; end if;
  if coalesce(trim(p_courier), '') = '' then raise exception 'Nama kurir wajib diisi'; end if;
  for i in select * from public.store_order_items where order_id = p_id loop
    select * into b from public.inventory_batches where id = i.batch_id for update;
    if b.on_hand_kg < i.qty_kg then raise exception 'Stok fisik % tidak cukup', b.commodity; end if;
    update public.inventory_batches set on_hand_kg = on_hand_kg - i.qty_kg, reserved_kg = greatest(reserved_kg - i.qty_kg, 0) where id = b.id;
    insert into public.stock_movements (batch_id, supplier_id, type, qty_kg, ref, note) values (b.id, b.supplier_id, 'out', i.qty_kg, 'order:' || p_id, 'Barang keluar (dikirim)');
  end loop;
  update public.store_orders set status = 'shipped', updated_at = now() where id = p_id;
  update public.shipments set status = 'shipped', courier = trim(p_courier), tracking_no = nullif(trim(p_tracking), ''), updated_at = now() where order_id = p_id;
  perform public._notify(so.store_id, 'Pesanan dikirim', so.code || ' via ' || trim(p_courier), '/pesanan');
end $$;

create or replace function public.store_receive_order(p_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare so public.store_orders;
begin
  perform public._need('store');
  select * into so from public.store_orders where id = p_id and store_id = auth.uid() for update;
  if not found or so.status <> 'shipped' then raise exception 'Pesanan belum dikirim'; end if;
  update public.store_orders set status = 'completed', updated_at = now() where id = p_id;
  update public.shipments set status = 'delivered', updated_at = now() where order_id = p_id;
  perform public._notify(so.supplier_id, 'Pesanan selesai', so.code, '/penjualan');
end $$;

create or replace function public.submit_review(p_id uuid, p_rating int, p_comment text) returns void language plpgsql security definer set search_path = public as $$
declare so public.store_orders;
begin
  perform public._need('store');
  select * into so from public.store_orders where id = p_id and store_id = auth.uid();
  if not found or so.status <> 'completed' then raise exception 'Ulasan hanya untuk pesanan selesai'; end if;
  if p_rating not between 1 and 5 then raise exception 'Rating 1-5'; end if;
  insert into public.reviews (order_id, store_id, supplier_id, rating, comment) values (p_id, auth.uid(), so.supplier_id, p_rating, nullif(trim(p_comment), ''));
exception when unique_violation then raise exception 'Pesanan ini sudah diulas';
end $$;

-- ---------- RPC publik untuk halaman depan ----------
create or replace function public.public_stats() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'farmers', (select count(*) from profiles where role = 'farmer' and is_active),
    'suppliers', (select count(*) from profiles where role = 'supplier' and is_active),
    'stores', (select count(*) from profiles where role = 'store' and is_active),
    'kg', coalesce((select sum(i.qty_kg) from store_order_items i join store_orders o on o.id = i.order_id where o.status = 'completed'), 0)) $$;
create or replace function public.featured_products() returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select b.commodity, b.grade, sp.price_per_kg, b.photo_path, coalesce(p.business_name, p.full_name) as supplier, p.location
    from supplier_products sp join inventory_batches b on b.id = sp.batch_id join profiles p on p.id = sp.supplier_id
    where sp.is_listed and p.is_active and b.on_hand_kg - b.reserved_kg > 0 order by sp.updated_at desc limit 6) x $$;
grant execute on function public.public_stats(), public.featured_products() to anon, authenticated;

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('offers', 'offers', true, 3145728, array['image/jpeg','image/png','image/webp']),
  ('proofs', 'proofs', false, 3145728, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "foto panen publik" on storage.objects;
drop policy if exists "petani upload foto" on storage.objects;
drop policy if exists "petani hapus foto" on storage.objects;
drop policy if exists "upload bukti bayar" on storage.objects;
drop policy if exists "baca bukti bayar" on storage.objects;
create policy "foto panen publik" on storage.objects for select using (bucket_id = 'offers');
create policy "petani upload foto" on storage.objects for insert to authenticated
  with check (bucket_id = 'offers' and (storage.foldername(name))[1] = auth.uid()::text and public.my_role() = 'farmer');
create policy "petani hapus foto" on storage.objects for delete to authenticated using (bucket_id = 'offers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "upload bukti bayar" on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text and public.my_role() in ('supplier','store'));
create policy "baca bukti bayar" on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

notify pgrst, 'reload schema';
