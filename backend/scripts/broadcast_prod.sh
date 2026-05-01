#!/usr/bin/env bash
# Wrapper for scripts/broadcast.py that pre-sets the two env overrides
# the local .env doesn't have right (FRONTEND_URL is localhost, token TTL
# is 1h). Without these the magic links in Segment A emails are dead
# links pointing at localhost AND expire before recipients click.
#
# Usage:
#   ./broadcast_prod.sh --email-id a1                              # dry-run
#   ./broadcast_prod.sh --email-id a1 --apply                       # live send
#   ./broadcast_prod.sh --email-id a1 --apply --only x@y.z         # smoke test
#
set -euo pipefail

export FRONTEND_URL="https://www.themamboguild.com"
export PASSWORD_RESET_EXPIRE_MINUTES="10080"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

exec python scripts/broadcast.py "$@"
