#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

REMOTE_HOST="test.com" 
CHECK_URL="http://$REMOTE_HOST/api/projects" 

echo -e "${GREEN}Checking application health on $REMOTE_HOST...${NC}"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $CHECK_URL)

if [ $RESPONSE -eq 200 ]; then
  echo -e "${GREEN}Application is healthy (HTTP 200).${NC}"
else
  echo -e "${RED}Application is unhealthy (HTTP $RESPONSE).${NC}"
  exit 1
fi