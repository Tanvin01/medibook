-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text, role text check (role in ('patient','doctor','admin')) default 'patient',
  avatar_url text, phone text, location text, created_at timestamptz default now()
);
-- Doctors table
create table doctors (
  id uuid references profiles(id) on delete cascade primary key,
  specialty text not null, bio text, consultation_fee int default 100,
  languages text[], verified boolean default false
);
-- Appointments table
create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id), doctor_id uuid references profiles(id),
  scheduled_at timestamptz not null, duration_minutes int default 30,
  status text default 'pending', video_room_url text, notes text,
  created_at timestamptz default now()
);
-- RLS
alter table appointments enable row level security;
create policy "users_own_appointments" on appointments for all using (patient_id = auth.uid() or doctor_id = auth.uid());
alter table profiles enable row level security;
create policy "public_profiles" on profiles for select using (true);
create policy "own_profile" on profiles for all using (id = auth.uid());
