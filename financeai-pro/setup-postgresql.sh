#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
status_ok() { echo -e "${GREEN}✓ $1${NC}"; }
status_warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
status_err() { echo -e "${RED}✗ $1${NC}"; }
header() { echo -e "\n${YELLOW}=== $1 ===${NC}"; }

echo -e "${YELLOW}Starting FinanceAI Pro Database Setup...${NC}"

# 1. HOMEBREW CHECK
header "Checking Homebrew"
if ! command -v brew &> /dev/null; then
    status_warn "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    status_ok "Homebrew already installed"
fi

# 2. POSTGRESQL INSTALLATION
header "Installing PostgreSQL 16"
if brew list postgresql@16 &>/dev/null; then
    status_ok "PostgreSQL 16 already installed"
else
    status_warn "Installing postgresql@16..."
    brew install postgresql@16
fi

# 3. POSTGRESQL START
header "Starting PostgreSQL Service"
if brew services list | grep -q "postgresql@16.*started"; then
    status_ok "PostgreSQL 16 service already running"
else
    status_warn "Starting postgresql@16 service..."
    brew services start postgresql@16
    status_warn "Waiting for PostgreSQL to start..."
    sleep 3
fi

# Ensure postgresql binaries are in PATH (for M1/M2/M3 Macs)
if [ -d "/opt/homebrew/opt/postgresql@16/bin" ]; then
    export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
fi

# 4. CREATE POSTGRES SUPER USER
header "Checking Postgres Superuser"
# Note: On macOS Homebrew, the current user is often the default superuser.
# We try to use the current user or 'postgres' to manage roles.
PG_USER=$(whoami)
if psql -U "$PG_USER" -d postgres -c "SELECT 1;" &>/dev/null; then
    ADMIN_USER="$PG_USER"
    status_ok "Current user '$PG_USER' can act as admin"
elif psql -U postgres -d postgres -c "SELECT 1;" &>/dev/null; then
    ADMIN_USER="postgres"
    status_ok "Postgres superuser already exists"
else
    status_warn "Attempting to create postgres superuser..."
    createuser -s postgres || status_warn "Could not create 'postgres' user, will attempt with current user"
    ADMIN_USER="postgres"
fi

# 5. CREATE FINANCEAI USER
header "Configuring FinanceAI User"
if psql -U "$ADMIN_USER" -d postgres -tAc "SELECT 1 FROM pg_user WHERE usename='financeai'" | grep -q 1; then
    status_ok "financeai user already exists"
else
    status_warn "Creating financeai user..."
    psql -U "$ADMIN_USER" -d postgres -c "CREATE USER financeai WITH PASSWORD 'financeai123';"
    psql -U "$ADMIN_USER" -d postgres -c "ALTER ROLE financeai WITH CREATEDB;"
    status_ok "financeai user created"
fi

# 6. CREATE FINANCEAI DATABASE
header "Configuring FinanceAI Database"
if psql -U "$ADMIN_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw financeai; then
    status_ok "financeai database already exists"
else
    status_warn "Creating financeai database..."
    psql -U "$ADMIN_USER" -d postgres -c "CREATE DATABASE financeai OWNER financeai;"
    status_ok "financeai database created"
fi

# 7. INSTALL PGVECTOR
header "Installing pgvector"
if brew list pgvector &>/dev/null; then
    status_ok "pgvector already installed"
else
    status_warn "Installing pgvector..."
    brew install pgvector
    status_ok "pgvector installed"
fi

# 8. ENABLE PGVECTOR IN DATABASE
header "Enabling pgvector Extension"
# Set PGPASSWORD temporarily for the connection
export PGPASSWORD='financeai123'
if psql -U financeai -d financeai -tAc "SELECT 1 FROM pg_extension WHERE extname = 'pgvector'" | grep -q 1; then
    status_ok "pgvector extension already enabled"
else
    status_warn "Enabling pgvector in financeai database..."
    psql -U financeai -d financeai -c "CREATE EXTENSION IF NOT EXISTS pgvector;"
    status_ok "pgvector extension enabled"
fi

# 9. TEST DATABASE CONNECTION
header "Testing Database Connection"
if psql -U financeai -d financeai -h localhost -c "SELECT 1;" &>/dev/null; then
    status_ok "Database connection successful"
else
    status_err "Database connection failed"
    status_warn "If error persists, run: brew services restart postgresql@16"
    exit 1
fi

# 10. FINAL VERIFICATION
header "Final Verification"
psql -U financeai -d financeai -c "\dt" || status_ok "No tables yet (normal before migrations)"
status_ok "Database ready for Prisma migrations"

# UNSET PGPASSWORD
unset PGPASSWORD

echo -e "\n${GREEN}✓ ✓ ✓ PostgreSQL 16 Setup Complete ✓ ✓ ✓${NC}"
echo -e "\n${YELLOW}Connection Details:${NC}"
echo -e "- Host: localhost"
echo -e "- Port: 5432"
echo -e "- Database: financeai"
echo -e "- User: financeai"
echo -e "- Password: financeai123"

echo -e "\n${GREEN}DATABASE_URL=postgresql://financeai:financeai123@localhost:5432/financeai${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Copy DATABASE_URL above"
echo -e "2. Paste into .env file"
echo -e "3. Run: npm install"
echo -e "4. Run: npx prisma generate"
echo -e "5. Run: npx prisma db push"

echo -e "\n${YELLOW}Rollback Instructions:${NC}"
echo -e "To reset everything: brew uninstall postgresql@16 pgvector && rm -rf /usr/local/var/postgres"
