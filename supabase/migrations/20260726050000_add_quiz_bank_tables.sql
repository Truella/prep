alter table quizzes add column visibility text not null default 'private'
  check (visibility in ('private', 'public', 'unlisted'));
alter table quizzes add column category text;
alter table quizzes add column difficulty text
  check (difficulty in ('Beginner', 'Intermediate', 'Advanced'));
alter table quizzes add column times_taken integer not null default 0;
alter table quizzes add column average_rating numeric;

create table quiz_ratings (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz default now(),
  unique (quiz_id, user_id)
);

alter table quiz_ratings enable row level security;
create policy "Anyone can read ratings" on quiz_ratings for select using (true);
create policy "Auth users can rate" on quiz_ratings for insert
  with check (auth.uid() = user_id);
create policy "Auth users can update own rating" on quiz_ratings for update
  using (auth.uid() = user_id);
