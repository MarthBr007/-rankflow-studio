# Database Setup Guide

Om de database migratie uit te voeren, heb je een PostgreSQL database nodig. Hier zijn verschillende opties:

## Optie 1: Supabase (Aanbevolen - Gratis)

1. **Maak een Supabase account**
   - Ga naar [https://supabase.com](https://supabase.com)
   - Maak een gratis account
   - Klik op "New Project"

2. **Maak een nieuw project**
   - Kies een naam voor je project
   - Kies een wachtwoord (bewaar dit goed!)
   - Wacht tot het project is aangemaakt

3. **Kopieer de connection string**
   - Ga naar Project Settings → Database
   - Scroll naar "Connection string"
   - Kies "URI" en kopieer de connection string
   - Vervang `[YOUR-PASSWORD]` met je wachtwoord

4. **Voeg toe aan `.env.local`**
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
   ```

## Optie 2: Lokale PostgreSQL

Als je PostgreSQL lokaal hebt geïnstalleerd:

1. **Maak een database**
   ```bash
   createdb rankflow
   ```

2. **Voeg toe aan `.env.local`**
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rankflow?schema=public"
   ```
   (Pas username en password aan naar jouw PostgreSQL credentials)

## Optie 3: Docker PostgreSQL (Lokaal)

1. **Start PostgreSQL container**
   ```bash
   docker run --name rankflow-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=rankflow \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Voeg toe aan `.env.local`**
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rankflow?schema=public"
   ```

## Optie 4: Neon (Serverless PostgreSQL - Aanbevolen)

Neon is een serverless PostgreSQL database die perfect werkt met Next.js en Vercel.

1. **Maak een Neon account**
   - Ga naar [https://neon.tech](https://neon.tech)
   - Maak een gratis account
   - Maak een nieuw project

2. **Kopieer de connection string**
   - Ga naar je project dashboard
   - Klik op "Connection Details" of "Connection String"
   - Kopieer de connection string (ziet eruit als: `postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require`)

3. **Voeg toe aan `.env.local`**
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require"
   ```

## Optie 5: Vercel Postgres

Als je Vercel gebruikt voor deployment:

1. **Maak Vercel Postgres database**
   - Ga naar je Vercel project
   - Storage → Create Database → Postgres
   - Kopieer de connection string

2. **Voeg toe aan `.env.local`**
   ```bash
   DATABASE_URL="postgres://default:[YOUR-PASSWORD]@[YOUR-HOST]:5432/verceldb?sslmode=require"
   ```

## Na het instellen van DATABASE_URL

Voer de migratie uit:

```bash
npx prisma migrate dev --name add_user_role
```

Dit zal:
- De database schema aanmaken
- De `role` kolom toevoegen aan de `User` tabel
- Alle bestaande users op `user` role zetten (je kunt later handmatig de eerste user op `admin` zetten)

## Eerste Admin User

Na de migratie:
1. Registreer je eerste gebruiker via `/register`
2. Deze krijgt automatisch `admin` role
3. Of maak handmatig een admin user via de database:
   ```sql
   UPDATE "User" SET role = 'admin' WHERE email = 'jouw@email.com';
   ```

