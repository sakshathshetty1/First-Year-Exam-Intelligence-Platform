-- Enable vector extension for embeddings
create extension if not exists vector;

-- Subjects Table (New Single Source of Truth)
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Exams Table
create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade, -- Link to subjects
  subject text, -- Deprecated, kept for backward compatibility if needed, but we rely on subject_id
  year integer not null,
  exam_type text not null, -- 'midterm', 'final', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Questions Table
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade not null,
  question_text text not null,
  marks integer,
  question_number text,
  embedding vector(768), -- Gemini embedding dimension
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clusters Table
create table if not exists clusters (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid references subjects(id) on delete cascade, -- Link to subjects
    topic_summary text,
    risk_level text, -- 'low', 'medium', 'high'
    avg_marks numeric,
    frequency integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Junction table for Question <-> Cluster
create table if not exists question_clusters (
    question_id uuid references questions(id) on delete cascade,
    cluster_id uuid references clusters(id) on delete cascade,
    primary key (question_id, cluster_id)
);

-- RLS Policies (Basic)
alter table subjects enable row level security;
alter table exams enable row level security;
alter table questions enable row level security;
alter table clusters enable row level security;
alter table question_clusters enable row level security;

-- Allow public read access (for students)
create policy "Allow public read subjects" on subjects for select using (true);
create policy "Allow public read exams" on exams for select using (true);
create policy "Allow public read questions" on questions for select using (true);
create policy "Allow public read clusters" on clusters for select using (true);
create policy "Allow public read question_clusters" on question_clusters for select using (true);

-- Allow upload (anon) - In production, this should be authenticated faculty only.
create policy "Allow anon insert subjects" on subjects for insert with check (true);
create policy "Allow anon insert exams" on exams for insert with check (true);
create policy "Allow anon insert questions" on questions for insert with check (true);
create policy "Allow anon insert clusters" on clusters for insert with check (true);
create policy "Allow anon insert question_clusters" on question_clusters for insert with check (true);

