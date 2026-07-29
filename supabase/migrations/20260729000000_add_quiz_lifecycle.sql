-- Add the draft/published lifecycle to quizzes.
alter table public.quizzes
  add column status text not null default 'draft'
  check (status in ('draft', 'published'));

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
  check (visibility in ('private', 'public'));

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
