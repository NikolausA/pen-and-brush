#!/bin/bash

if [ $# -ne 2 ]; then
    echo "Usage: $0 <username> <password>"
    exit 1
fi

USERNAME=$1
PASSWORD=$2

psql -U postgres -c "CREATE ROLE $USERNAME WITH LOGIN PASSWORD '$PASSWORD' SUPERUSER CREATEDB CREATEROLE INHERIT;"

if [ $? -eq 0 ]; then
    echo "User $USERNAME created successfully with superuser privileges."
else
    echo "Error: Failed to create user $USERNAME."
    exit 1
fi

psql -U postgres -c "\du $USERNAME"