-- Run with: supabase migration up --no-transaction
-- CREATE INDEX CONCURRENTLY cannot run inside a transaction block.

create unique index concurrently if not exists idx_quizzes_code
  on public.quizzes (code)
  where code is not null;
