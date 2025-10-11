#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

REMOTE_USER="..."
REMOTE_HOST="..."
REMOTE_PATH="/home/$REMOTE_USER/pen-and-brush/backend"
SSH_KEY="~/.ssh/id_rsa"
DOMAIN="test.com" 

echo -e "${GREEN}Starting deployment to $REMOTE_HOST...${NC}"

./build.sh

rsync -avz -e "ssh -i $SSH_KEY" dist/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/dist/ --exclude node_modules

ssh -i $SSH_KEY $REMOTE_USER@$REMOTE_HOST << EOF
  cd $REMOTE_PATH
  npm install -g pm2 || true
  pm2 stop graphic-editor || true
  rm -rf $REMOTE_PATH/dist/*
  cp -r $REMOTE_PATH/dist.bak/* $REMOTE_PATH/dist/
  pm2 start $REMOTE_PATH/dist/app.js --name graphic-editor || pm2 restart graphic-editor
  cat > /etc/nginx/sites-available/graphic-editor << EOL
server {
  listen 80;
  server_name $DOMAIN;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
  }
}
EOL
  ln -sf /etc/nginx/sites-available/graphic-editor /etc/nginx/sites-enabled/
  sudo ufw allow 80/tcp
  sudo ufw --force enable
  nginx -t && systemctl reload nginx
  if sudo netstat -tuln | grep -q ":80"; then
    echo -e "${GREEN}Port 80 is open and Nginx is listening.${NC}"
  else
    echo -e "${RED}Port 80 is not open! Check Nginx configuration.${NC}"
  fi
  echo -e "${GREEN}Deployment and Nginx config completed on remote server!${NC}"
EOF

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deployment successful!${NC}"
else
  echo -e "${RED}Deployment failed!${NC}"
  exit 1
fi