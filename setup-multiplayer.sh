#!/bin/bash

# KRED Multiplayer Setup Script

echo "🎮 Setting up KRED Multiplayer..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project root
cd "$(dirname "$0")"

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install
npm install --workspaces

echo -e "${YELLOW}Step 2: Building shared package...${NC}"
cd packages/shared
npm run build
cd ../..

echo -e "${YELLOW}Step 3: Setting up database...${NC}"
echo "Please enter your MySQL root password when prompted:"
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS kred_multiplayer;"

echo "Importing database schema..."
mysql -u root -p kred_multiplayer < packages/server/schema.sql

echo -e "${YELLOW}Step 4: Creating environment file...${NC}"
if [ ! -f packages/server/.env ]; then
    cp packages/server/.env.example packages/server/.env
    echo -e "${GREEN}Created packages/server/.env${NC}"
    echo "Please edit packages/server/.env with your database credentials"
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit packages/server/.env with your database credentials"
echo "2. Start the server: npm run dev:server"
echo "3. Start the client: npm run dev:client"
echo "4. Open http://localhost:5173 in multiple browser windows"
echo ""
