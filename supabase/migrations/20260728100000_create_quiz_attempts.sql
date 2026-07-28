create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  score integer not null check (score >= 0),
  total_points integer not null check (total_points >= 0),
  elapsed_seconds integer check (elapsed_seconds >= 0),
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  completed_at timestamptz not null default now(),
  constraint score_not_exceed_total check (score <= total_points)
);

create index idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);

alter table public.quiz_attempts enable row level security;

create policy "Authenticated users can insert attempts"
  on public.quiz_attempts for insert
  with check (auth.role() = 'authenticated');

create policy "Quiz owner can read attempts"
  on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.quizzes
      where id = quiz_id and created_by = auth.uid()
    )
  );
