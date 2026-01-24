#!/bin/bash

# Script om database setup te automatiseren na Vercel Postgres aanmaken
# Gebruik: ./scripts/setup-vercel-db.sh

echo "🔧 Database Setup Script"
echo "========================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is niet ingesteld"
  echo ""
  echo "Voeg eerst DATABASE_URL toe aan Vercel:"
  echo "1. Ga naar Vercel Dashboard → Project → Settings → Environment Variables"
  echo "2. Voeg toe: DATABASE_URL met je database connection string"
  echo "3. Of gebruik: npx vercel env add DATABASE_URL production"
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL gevonden"
echo ""

# Generate Prisma Client
echo "📦 Prisma Client genereren..."
npx prisma generate

# Push schema to database
echo "🗄️  Database schema pushen..."
npx prisma db push

# Create admin user
echo "👤 Admin gebruiker aanmaken..."
node scripts/create-admin.js

echo ""
echo "✅ Database setup voltooid!"
echo ""
echo "📧 Login met:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "Of gebruik environment variables:"
echo "   ADMIN_EMAIL=je@email.com"
echo "   ADMIN_PASSWORD=je-wachtwoord"
echo ""
