alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1) || '_' || substr(new.id::text,1,6)),
    new.raw_user_meta_data->>'full_name',
    'customer',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
