# 🚀 Full Deployment Checklist — DRN Token Sale Platform

## 🌍 1️⃣ Infrastructure Setup
- [x] Purchase domain (e.g., dronera.eu)
- [x] Set up DNS (e.g., Netlify, Cloudflare, Vercel)
- [x] Set up Supabase project (Postgres DB, Edge Functions)
- [x] Set up smart contract deployment (Polygon Mumbai, Base, Ethereum)
- [x] Set up SMTP provider (Postmark, Resend, or custom SMTP)

## 💾 2️⃣ Backend Deployment
- [x] Deploy Supabase database (apply schema)
- [x] Set up storage buckets for contracts (PDFs)
- [x] Configure RLS if needed
- [x] Deploy Supabase Edge Functions (Stripe, PDF, Email, Reports)
- [x] Deploy smart contracts using Hardhat/Foundry
- [x] Verify contracts on Etherscan
- [x] Store contract addresses + ABI in frontend .env

## 💻 3️⃣ Frontend Deployment
- [x] Set up React app (MetaMask, Stripe, KYC, Admin Dashboard)
- [x] Configure .env (Supabase, Stripe, contracts, SMTP)
- [x] Build + deploy (npm run build, Netlify/Vercel)

## 🔒 4️⃣ CI/CD Setup
- [x] Push code to GitHub
- [x] Add GitHub Secrets (NETLIFY_AUTH_TOKEN, etc.)
- [x] Check .github/workflows/deploy.yml

## 📧 5️⃣ Email + Notification Setup
- [x] Set up SMTP backend
- [x] Test email templates (HTML + Markdown)
- [x] Configure user notifications (email, KYC, contracts)

## 📊 6️⃣ Admin Dashboard Checks
- [x] Connect dashboard to Supabase
- [x] Verify users, payments, tokens, reports
- [x] Test manual admin actions (approve KYC, resend emails, trigger buyback)

## 🔨 7️⃣ Final Tests
- [x] Test Stripe + KYC flow
- [x] Test MetaMask purchase flow
- [x] Verify Supabase record updates
- [x] Verify smart contract interactions
- [x] Test admin reports + charts

## ✅ Final GO-LIVE
- 🚀 Announce launch
- 🔐 Monitor logs + payments
- 📈 Watch sales roll in!
