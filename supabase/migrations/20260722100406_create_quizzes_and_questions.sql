create table public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  created_by  uuid references auth.users(id) on delete cascade,
  created_at  timestamptz default now()
);

alter table public.quizzes enable row level security;

create policy "Users can manage own quizzes"
  on public.quizzes for all
  using (auth.uid() = created_by);

create policy "Anyone can read quizzes"
  on public.quizzes for select
  using (true);

create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid references public.quizzes(id) on delete cascade,
  "Question"     text not null,
  "Option_A"     text not null,
  "Option_B"     text not null,
  "Option_C"     text not null,
  "Option_D"     text not null,
  "Correct_Answer" text check ("Correct_Answer" in ('A','B','C','D')) not null,
  "Points"       integer default 1,
  created_at     timestamptz default now()
);

alter table public.questions enable row level security;

create policy "Anyone can read questions"
  on public.questions for select
  using (true);

create policy "Quiz owner can insert questions"
  on public.questions for insert
  with check (
    exists (
      select 1 from public.quizzes
      where id = quiz_id and created_by = auth.uid()
    )
  );
