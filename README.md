# MediBook — Doctor Appointment & Healthcare Platform

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

A HIPAA-conscious appointment booking platform with doctor discovery, availability management, video consultations, and a patient health portal.

## ✨ Features

- **Doctor Discovery** — Search by specialty, location, language, and insurance
- **Smart Scheduling** — Real-time availability calendar with slot booking
- **Video Consultations** — Integrated Whereby/Daily.co video calls
- **Patient Portal** — Medical history, prescriptions, lab results
- **Doctor Dashboard** — Appointment management, patient records, notes
- **Reminders** — Automated SMS/email appointment reminders
- **Insurance Verification** — Basic insurance plan compatibility check
- **File Uploads** — Secure medical document storage via Supabase Storage
- **Rating System** — Post-consultation doctor ratings and reviews
- **Row-Level Security** — Supabase RLS policies for patient data privacy

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Auth | Supabase Auth (email, Google, phone OTP) |
| Styling | Tailwind CSS |
| UI | Radix UI + shadcn/ui |
| Video | Daily.co API |
| Email | Resend |
| SMS | Twilio |
| Deployment | Vercel |

## 🗂 Project Structure

```
medibook/
├── app/
│   ├── (patient)/
│   │   ├── find-doctors/page.tsx
│   │   ├── appointments/page.tsx
│   │   └── health-records/page.tsx
│   ├── (doctor)/
│   │   ├── dashboard/page.tsx
│   │   ├── schedule/page.tsx
│   │   └── patients/page.tsx
│   ├── appointments/
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── video/page.tsx
│   └── api/
│       ├── appointments/route.ts
│       ├── availability/route.ts
│       └── video-room/route.ts
├── components/
│   ├── booking/
│   │   ├── DoctorCard.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── BookingModal.tsx
│   └── dashboard/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── validations.ts
└── supabase/
    ├── migrations/
    └── functions/
        └── send-reminder/
```

## 🔐 Database Schema (Supabase)

```sql
-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  role text check (role in ('patient', 'doctor', 'admin')),
  avatar_url text,
  phone text,
  created_at timestamptz default now()
);

-- Doctors table
create table doctors (
  id uuid references profiles(id) on delete cascade,
  specialty text not null,
  bio text,
  consultation_fee int,
  languages text[],
  verified boolean default false
);

-- Appointments table
create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id),
  doctor_id uuid references profiles(id),
  scheduled_at timestamptz not null,
  duration_minutes int default 30,
  status text default 'pending',
  video_room_url text,
  notes text,
  created_at timestamptz default now()
);

-- Row-level security
alter table appointments enable row level security;
create policy "patients see own appointments"
  on appointments for select
  using (patient_id = auth.uid() or doctor_id = auth.uid());
```

## 🚀 Getting Started

```bash
git clone https://github.com/Tanvin01/medibook.git
cd medibook
npm install
cp .env.example .env.local
npm run dev
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DAILY_API_KEY=your-daily-co-key
RESEND_API_KEY=your-resend-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```
