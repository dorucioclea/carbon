#!/bin/bash

# ______________Node___________________
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 
# nvm use 20 

npm install
npm run db:start

cp ./.env.example ./.env

read -p "Enter SUPABASE_SERVICE_ROLE key: " supabase_service_role
read -p "Enter SUPABASE_ANON_PUBLIC key: " supabase_anon_public
read -p "Enter UPSTASH_REDIS_REST_URL: " upstash_redis_rest_url
read -p "Enter UPSTASH_REDIS_REST_TOKEN: " upstash_redis_rest_token
read -p "Enter TRIGGER_PUBLIC_API_KEY: " trigger_public_api_key
read -p "Enter TRIGGER_API_KEY: " trigger_api_key
read -p "Enter POSTHOG_API_HOST: " posthog_api_host
read -p "Enter POSTHOG_PROJECT_PUBLIC_KEY: " posthog_project_public_key

sed -i '' "s/SUPABASE_SERVICE_ROLE=.*$/SUPABASE_SERVICE_ROLE=$supabase_service_role/" ./.env
sed -i '' "s/SUPABASE_ANON_PUBLIC=.*$/SUPABASE_ANON_PUBLIC=$supabase_anon_public/" ./.env
sed -i '' "s/UPSTASH_REDIS_REST_URL=.*$/UPSTASH_REDIS_REST_URL=$upstash_redis_rest_url/" ./.env
sed -i '' "s/UPSTASH_REDIS_REST_TOKEN=.*$/UPSTASH_REDIS_REST_TOKEN=$upstash_redis_rest_token/" ./.env
sed -i '' "s/TRIGGER_PUBLIC_API_KEY=.*$/TRIGGER_PUBLIC_API_KEY=$trigger_public_api_key/" ./.env
sed -i '' "s/TRIGGER_API_KEY=.*$/TRIGGER_API_KEY=$trigger_api_key/" ./.env
sed -i '' "s/POSTHOG_API_HOST=.*$/POSTHOG_API_HOST=$posthog_api_host/" ./.env
sed -i '' "s/POSTHOG_PROJECT_PUBLIC_KEY=.*$/POSTHOG_PROJECT_PUBLIC_KEY=$posthog_project_public_key/" ./.env

npm run db:build
npm run build:app
npm run dev

# npm run db:kill #This will kill the DB
# npm run db:build

echo "Setup complete. You can now sign in with the default credentials."