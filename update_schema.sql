-- Enable RLS on all tables
alter table subjects enable row level security;
alter table exams enable row level security;
alter table questions enable row level security;
alter table clusters enable row level security;
alter table question_clusters enable row level security;

-- Drop existing policies to ensure clean state
drop policy if exists "Enable read access for all users" on subjects;
drop policy if exists "Enable read access for all users" on exams;
drop policy if exists "Enable read access for all users" on questions;
drop policy if exists "Enable read access for all users" on clusters;
drop policy if exists "Enable read access for all users" on question_clusters;

drop policy if exists "Faculty insert subjects" on subjects;
drop policy if exists "Faculty insert exams" on exams;
drop policy if exists "Faculty insert questions" on questions;
drop policy if exists "Faculty insert clusters" on clusters;
drop policy if exists "Faculty insert question_clusters" on question_clusters;

drop policy if exists "Faculty select own exams" on exams;

-- 1. Subjects Table
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- 2. Exams Table
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade,
  created_at timestamptz default now()
);
-- Ensure correct columns exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'exams' and column_name = 'subject_type') then
        alter table exams add column subject_type text check (subject_type in ('Internal', 'End Semester'));
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'exams' and column_name = 'uploaded_by') then
        alter table exams add column uploaded_by uuid references auth.users(id);
    end if;
end $$;

-- 3. Questions Table
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade,
  question_text text not null,
  marks integer,
  created_at timestamptz default now()
);

-- 4. Clusters Table
create table if not exists clusters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade,
  subject_type text,
  created_at timestamptz default now()
);

-- 5. Question Clusters
create table if not exists question_clusters (
  question_id uuid references questions(id) on delete cascade,
  cluster_id uuid references clusters(id) on delete cascade
);
-- Ensure composite PK
do $$
begin
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'question_clusters_pkey') then
        alter table question_clusters add primary key (question_id, cluster_id);
    end if;
end $$;


-- RLS POLICIES

-- READ: Allow SELECT for everyone (Students + Faculty)
-- "Student rules: Read-only access: Allow SELECT"
create policy "Enable read access for all users" on subjects for select using (true);
create policy "Enable read access for all users" on exams for select using (true);
create policy "Enable read access for all users" on questions for select using (true);
create policy "Enable read access for all users" on clusters for select using (true);
create policy "Enable read access for all users" on question_clusters for select using (true);

-- WRITE (INSERT): Faculty Only

-- Subjects: Allow faculty to create new subjects if needed
create policy "Faculty insert subjects" on subjects for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'faculty'
);

-- Exams: Allow faculty to insert only if they are the uploader
create policy "Faculty insert exams" on exams for insert with check (
  auth.uid() = uploaded_by AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'faculty'
);

-- Questions: Allow faculty to insert questions for their own exams
create policy "Faculty insert questions" on questions for insert with check (
  exists (
    select 1 from exams 
    where id = questions.exam_id 
    and uploaded_by = auth.uid()
  ) AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'faculty'
);

-- Clusters: Allow faculty logic to insert clusters
create policy "Faculty insert clusters" on clusters for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'faculty'
);

-- Question Clusters: Allow faculty logic to insert mapping
create policy "Faculty insert question_clusters" on question_clusters for insert with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'faculty'
);
