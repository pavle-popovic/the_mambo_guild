@echo off
REM Wrapper for scripts\broadcast.py that pre-sets the two env overrides
REM the local .env doesn't have right (FRONTEND_URL is localhost, token TTL
REM is 1h). Without these the magic links in Segment A emails are dead
REM links pointing at localhost AND expire before recipients click.
REM
REM Usage:
REM   broadcast_prod.bat --email-id a1                            (dry-run)
REM   broadcast_prod.bat --email-id a1 --apply                    (live send)
REM   broadcast_prod.bat --email-id a1 --apply --only x@y.z      (smoke test)

set "FRONTEND_URL=https://www.themamboguild.com"
set "PASSWORD_RESET_EXPIRE_MINUTES=10080"

pushd "%~dp0.."
python scripts\broadcast.py %*
popd
