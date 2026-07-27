alter table public.quizzes
  add column code text;

create unique index idx_quizzes_code on public.quizzes (code) where code is not null;
