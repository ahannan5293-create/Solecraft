alter table public.profiles add column username_chosen boolean not null default true;

-- Update the handle_new_user trigger to set username_chosen appropriately
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_chosen boolean;
  final_username text;
begin
  if new.raw_user_meta_data->>'username' is not null then
    is_chosen := true;
    final_username := new.raw_user_meta_data->>'username';
  else
    is_chosen := false;
    final_username := split_part(new.email,'@',1) || '_' || substr(new.id::text,1,6);
  end if;

  insert into public.profiles (id, username, full_name, role, username_chosen)
  values (
    new.id,
    final_username,
    new.raw_user_meta_data->>'full_name',
    'customer',
    is_chosen
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
