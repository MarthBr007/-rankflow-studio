#!/bin/bash

# Script om lokale PostgreSQL database op te zetten met Docker

echo "🚀 Starting PostgreSQL database with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if container already exists
if docker ps -a | grep -q rankflow-postgres; then
    echo "📦 Container already exists. Starting it..."
    docker start rankflow-postgres
else
    echo "📦 Creating new PostgreSQL container..."
    docker run --name rankflow-postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=rankflow \
        -p 5432:5432 \
        -d postgres:15
    
    echo "⏳ Waiting for database to be ready..."
    sleep 5
fi

echo "✅ PostgreSQL is running!"
echo ""
echo "📝 Add this to your .env.local file:"
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rankflow?schema=public"'
echo ""
echo "Then run: npx prisma migrate dev --name add_user_role"

