-- Add the draft/published lifecycle to quizzes.
-- Using NOT VALID to skip expensive scan on existing rows; validate below.
alter table public.quizzes
  add column status text not null default 'draft';

alter table public.quizzes
  add constraint quizzes_status_check
  check (status in ('draft', 'published')) not valid;

-- Existing quizzes with an active code are already live.
update public.quizzes
set status = 'published'
where code is not null;

-- Visibility is now limited to private and public.
update public.quizzes
set visibility = 'private'
where visibility = 'unlisted';

alter table public.quizzes
  drop constraint if exists quizzes_visibility_check;

alter table public.quizzes
  add constraint quizzes_visibility_check
  check (visibility in ('private', 'public')) not valid;

-- Validate both newly-added constraints against existing rows.
alter table public.quizzes validate constraint quizzes_status_check;
alter table public.quizzes validate constraint quizzes_visibility_check;

-- Draft quizzes must not have an active code.
update public.quizzes
set code = null
where status = 'draft';

drop policy if exists "Anyone can read quizzes" on public.quizzes;

create policy "Anyone can read published quizzes"
  on public.quizzes for select
  using (
    status = 'published'
    or auth.uid() = created_by
  );

-- Questions inherit the quiz's visibility: only published quizzes' questions are publicly readable.
drop policy if exists "Anyone can read questions" on public.questions;

create policy "Anyone can read published questions"
  on public.questions for select
  using (
    exists (
      select 1 from public.quizzes
      where id = quiz_id
        and (status = 'published' or created_by = auth.uid())
    )
  );
