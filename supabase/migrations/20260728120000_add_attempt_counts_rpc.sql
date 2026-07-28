drop function if exists public.get_quiz_attempt_counts;

create or replace function public.get_quiz_attempt_counts(quiz_ids uuid[])
returns table (quiz_id uuid, count bigint)
language sql
stable
as $$
  select quiz_id, count(*)::bigint
  from public.quiz_attempts
  where quiz_id = any(quiz_ids)
  group by quiz_id;
$$;
