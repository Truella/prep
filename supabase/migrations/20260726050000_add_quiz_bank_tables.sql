alter table quizzes add column visibility text not null default 'private'
  check (visibility in ('private', 'public', 'unlisted'));
alter table quizzes add column category text
  check (category in ('General Knowledge', 'Science', 'History', 'Mathematics', 'Language & Literature', 'Technology', 'Arts & Culture', 'Geography', 'Health & Medicine', 'Business & Economics'));
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
create policy "Users can read own ratings" on quiz_ratings for select using (auth.uid() = user_id);
create policy "Auth users can rate public quizzes" on quiz_ratings for insert
  with check (
    auth.uid() = user_id AND
    exists (select 1 from quizzes where id = quiz_id and visibility = 'public')
  );
create policy "Auth users can update own rating on public quizzes" on quiz_ratings for update
  using (
    auth.uid() = user_id AND
    exists (select 1 from quizzes where id = quiz_id and visibility = 'public')
  );

create or replace function update_quiz_average_rating()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    update quizzes
    set average_rating = (
      select avg(rating)::numeric from quiz_ratings where quiz_id = NEW.quiz_id
    )
    where id = NEW.quiz_id;
  elsif TG_OP = 'DELETE' then
    update quizzes
    set average_rating = (
      select avg(rating)::numeric from quiz_ratings where quiz_id = OLD.quiz_id
    )
    where id = OLD.quiz_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_quiz_rating_change
after insert or update or delete on quiz_ratings
for each row execute function update_quiz_average_rating();
