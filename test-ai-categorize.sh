#!/bin/bash
# Test the AI categorization endpoint

curl -X POST http://localhost:4000/api/ai/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete quarterly financial report",
    "description": "Prepare and submit Q4 financial report to management",
    "priority": "high"
  }' | jq .
