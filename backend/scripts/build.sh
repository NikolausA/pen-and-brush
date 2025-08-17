#!/bin/bash

set -e

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting build process...${NC}"

rm -rf dist
mkdir -p dist

cp -r src/* dist/

cd dist
npm install --production
cd ..

echo -e "${GREEN}Build completed successfully!${NC}"