create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  score integer not null,
  total_points integer not null,
  elapsed_seconds integer,
  answers jsonb not null,
  completed_at timestamptz default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Anyone can insert attempts"
  on public.quiz_attempts for insert
  with check (true);

create policy "Quiz owner can read attempts"
  on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.quizzes
      where id = quiz_id and created_by = auth.uid()
    )
  );
