# MangaMappings
A light weight manga mappings API built on [MALSync](https://malsync.moe), [Consumet](https://consumet.org), and [illusionTBA's AniMappings](https://github.com/illusionTBA/AniMappings).

## Information
All credit goes to [illusionTBA](https://github.com/illusionTBA/AniMappings) for the base code. He gave me permission to make this repository, so please visit his repository first before using this one.

## Installation
1. Clone this repository.
```bash
git clone https://github.com/Eltik/MangaMappings
```
2. Install PostgreSQL version 15 and run the following to install the correct extensions:
```sql
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

create or replace function most_similar(text, text[]) returns double precision
language sql as $$
    select max(similarity($1,x)) from unnest($2) f(x)
$$;
```
3. Run `npm run build`.
4. Visit `http://localhost:3000`.