#!/bin/sh
# Installs everything for BizLocate (Mac / Linux). Run:  sh install.sh
set -e
echo "== Installing server packages =="
cd server
npm install
[ -f .env ] || cp .env.example .env
cd ..
echo "== Installing client packages =="
cd client
npm install
cd ..
echo ""
echo "Done. Start MongoDB, then:"
echo "  Terminal 1:  cd server && npm run seed && npm run dev"
echo "  Terminal 2:  cd client && npm run dev"
