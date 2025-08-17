#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

REMOTE_USER="..."
REMOTE_HOST="..."
REMOTE_PATH="/home/$REMOTE_USER/pen-and-brush/backend"
SSH_KEY="~/.ssh/id_rsa"

echo -e "${GREEN}Starting database migration on $REMOTE_HOST...${NC}"

ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF
  cd $REMOTE_PATH
  # Run Sequelize sync
  export $(cat .env | xargs) && node dist/app.js --sync
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database migration completed successfully!${NC}"
  else
    echo -e "${RED}Database migration failed!${NC}"
    exit 1
  fi
EOF

echo -e "${GREEN}Database migration process finished.${NC}"