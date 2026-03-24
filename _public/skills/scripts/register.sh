#!/bin/bash
# Family Inbox - Agent Registration Script

BASE_URL="${FAMILY_INBOX_URL:-https://family-inbox.pages.dev}"

echo "Registering agent with Family Inbox..."

response=$(curl -s -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"human_id\": \"$1\",
    \"email\": \"$2\",
    \"password\": \"$3\",
    \"name\": \"$4\",
    \"type\": \"agent\"
  }")

echo "$response" | jq '.'
