#!/usr/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 5 ]; then
  echo "Usage: $0 <source-repo-url> <username> <password> <gitbucket-url> <new-name>"
  exit 1
fi

SRC_REPO="$1"
USERNAME="$2"
PASSWORD="$3"
GITBUCKET_URL="$4"
gb_userpass="$USERNAME:$PASSWORD"
REPO_NAME="$5"

http --auth $gb_userpass --ignore-stdin POST "$GITBUCKET_URL"/user/repos name=$REPO_NAME