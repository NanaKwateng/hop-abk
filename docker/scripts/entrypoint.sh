#!/bin/bash
# docker/scripts/entrypoint.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN} Starting HOP Application...${NC}"

# Check environment
if [ -z "$NODE_ENV" ]; then
    echo -e "${YELLOW}⚠️  NODE_ENV not set, defaulting to development${NC}"
    export NODE_ENV=development
fi

echo -e "${GREEN}📦 Environment: $NODE_ENV${NC}"

# Run database migrations
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}🗄️  Running database migrations...${NC}"
    npm run migrate || echo -e "${YELLOW}⚠️  Migration failed, continuing...${NC}"
fi

# Start the application
echo -e "${GREEN}🔄 Starting application...${NC}"
exec "$@"