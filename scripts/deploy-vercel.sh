#!/bin/bash

# Vercel Deployment Script
# Dit script helpt je met het deployen naar Vercel

set -e

echo "🚀 Vercel Deployment Script"
echo "============================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "❌ Git repository niet gevonden!"
  echo "Run eerst: git init"
  exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Er zijn uncommitte changes!"
  echo ""
  echo "Wil je deze committen? (y/n)"
  read -r response
  if [ "$response" = "y" ]; then
    echo ""
    echo "📝 Committing changes..."
    git add .
    echo "Commit message (default: 'Deploy to Vercel'):"
    read -r commit_msg
    commit_msg=${commit_msg:-"Deploy to Vercel"}
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
  else
    echo "❌ Deployment geannuleerd"
    exit 1
  fi
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
  echo ""
  echo "⚠️  Geen 'origin' remote gevonden!"
  echo "Voeg GitHub remote toe:"
  echo "  git remote add origin <your-github-repo-url>"
  exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo ""
  echo "⚠️  Vercel CLI niet geïnstalleerd!"
  echo ""
  echo "Installeer met: npm i -g vercel"
  echo ""
  echo "Of gebruik Vercel Dashboard:"
  echo "  1. Ga naar vercel.com"
  echo "  2. Import je GitHub repository"
  echo "  3. Configureer environment variables"
  echo "  4. Deploy"
  exit 1
fi

# Test build
echo ""
echo "🔨 Testing build..."
if npm run build; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed! Fix errors before deploying"
  exit 1
fi

# Check environment variables
echo ""
echo "🔐 Checking environment variables..."
echo ""
echo "Zorg dat je deze environment variables hebt in Vercel:"
echo "  - DATABASE_URL (VERPLICHT)"
echo "  - SESSION_SECRET (VERPLICHT)"
echo "  - ENCRYPTION_KEY (VERPLICHT)"
echo ""
echo "Genereer secrets:"
echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
echo "✅ Pushed to GitHub"

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "Opties:"
echo "  1. Preview deployment (vercel)"
echo "  2. Production deployment (vercel --prod)"
echo ""
echo "Kies optie (1 of 2):"
read -r deploy_option

if [ "$deploy_option" = "2" ]; then
  vercel --prod
else
  vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check Vercel dashboard voor deployment status"
echo "  2. Run database migrations: npx prisma migrate deploy"
echo "  3. Test de deployed app"
echo "  4. Check environment variables in Vercel dashboard"
