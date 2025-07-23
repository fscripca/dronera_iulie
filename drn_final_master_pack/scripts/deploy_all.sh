#!/bin/bash
echo "🚀 Deploying smart contracts..."
npx hardhat deploy --network polygon_mumbai

echo "🔧 Applying DB schema..."
psql -h localhost -p 5432 -U postgres -d drn_db -f scripts/supabase_auto_report.sql

echo "🌱 Seeding database..."
node scripts/seedDatabase.js

echo "⚙️ Building frontend..."
npm run build

echo "🌍 Deploying frontend..."
npx netlify deploy --prod --dir=dist --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN

echo "✅ Full deployment chain completed!"

# Note: Make sure to run `chmod +x scripts/deploy_all.sh` before executing.
