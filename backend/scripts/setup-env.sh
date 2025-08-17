#!/bin/bash

set -e

GREEN='\033[0;32m'
NC='\033[0m'

REMOTE_USER="..."
REMOTE_HOST="..."
REMOTE_PATH="/home/$REMOTE_USER/pen-and-brush/backend"
SSH_KEY="~/.ssh/id_rsa"

echo -e "${GREEN}Setting up environment on $REMOTE_HOST...${NC}"

ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF
  cd $REMOTE_PATH
  # Update and install dependencies
  sudo apt update
  sudo apt install -y nginx nodejs npm pm2
  # Create .env file if it doesn't exist
  if [ ! -f .env ]; then
    cat > .env << EOL
NODE_ENV=production
PORT=3000
PROD_HOST=your_domain.com
PROD_PORT=80
PROD_DB_HOST=your_db_host
PROD_DB_PORT=5432
PROD_DB_USER=user
PROD_DB_PASSWORD=password
PROD_DB_NAME=graphic_editor
PROD_FRONTEND_URL=https://test.com
API_PREFIX=/api
EOL
    echo -e "${GREEN}.env file created.${NC}"
  else
    echo -e "${GREEN}.env file already exists, skipping creation.${NC}"
  fi
  # Set permissions
  chmod 600 .env
EOF

echo -e "${GREEN}Environment setup completed!${NC}"