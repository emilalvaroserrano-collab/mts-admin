#!/usr/bin/env bash
# Print the JSON from every MTS HTTP endpoint.
# Reads run by default. Writes run only with WRITE=1.
#
#   MTS_API_KEY=mts_... BASE=https://mts.192-888-702-801.site ./scripts/curl-api.sh
#   MTS_API_KEY=mts_... WRITE=1 ./scripts/curl-api.sh
set -u
BASE="${BASE:-http://127.0.0.1:8080}"
KEY="${MTS_API_KEY:-}"
WRITE="${WRITE:-0}"

call() {
  local method="$1" path="$2" body="${3:-}" auth="${4:-key}"
  echo
  echo "===== $method $path ====="
  local -a args=(-sS -w "\nHTTP %{http_code}\n" -X "$method" "$BASE$path" -H "Accept: application/json")
  if [[ "$auth" == "key" ]]; then
    if [[ -z "$KEY" ]]; then
      echo "skipped: set MTS_API_KEY"
      return
    fi
    args+=(-H "Authorization: Bearer $KEY")
  fi
  if [[ -n "$body" ]]; then
    args+=(-H "Content-Type: application/json" -d "$body")
  fi
  curl "${args[@]}"
  echo
}

json_id() {
  python3 -c 'import json,sys,re
raw=sys.stdin.read()
match=re.search(r"[\[{]", raw)
if not match:
  print(""); raise SystemExit
try:
  data=json.loads(raw[match.start():raw.rfind("HTTP ")].strip() if "HTTP " in raw[match.start():] else raw[match.start():])
except Exception:
  print(""); raise SystemExit
rows=data
if isinstance(data, dict):
  for key in ("customers","tickets","orders","notices","requests","items","complaints"):
    if isinstance(data.get(key), list):
      rows=data[key]; break
  else:
    print(data.get("id") or ""); raise SystemExit
if isinstance(rows, list) and rows and isinstance(rows[0], dict):
  print(rows[0].get("id") or "")
else:
  print("")'
}

echo "BASE $BASE"
call GET /api/openapi.json "" none
call GET /api/auth/get-session "" none
call POST /api/jobs/run '{}' none
call POST /api/zendesk/webhook '{}' none
call POST /api/payments/alternative '{}' none

CUSTOMERS="$(call GET "/api/agent/customers?q=")"
echo "$CUSTOMERS"
ID="$(printf '%s' "$CUSTOMERS" | json_id || true)"
if [[ -z "$ID" ]]; then
  echo
  echo "No customer id in the list. Remaining customer routes were not called."
  exit 0
fi
echo "Using customer $ID"

for path in \
  "/api/agent/customers/$ID" \
  "/api/agent/customers/$ID/pages" \
  "/api/agent/customers/$ID/home" \
  "/api/agent/customers/$ID/shop" \
  "/api/agent/customers/$ID/billing" \
  "/api/agent/customers/$ID/organization" \
  "/api/agent/customers/$ID/tickets" \
  "/api/agent/customers/$ID/orders" \
  "/api/agent/customers/$ID/services" \
  "/api/agent/customers/$ID/complaints" \
  "/api/agent/customers/$ID/notices"
do
  BODY="$(call GET "$path")"
  echo "$BODY"
  case "$path" in
    */tickets) TICKET="$(printf '%s' "$BODY" | json_id || true)" ;;
    */orders) ORDER="$(printf '%s' "$BODY" | json_id || true)" ;;
    */notices) NOTICE="$(printf '%s' "$BODY" | json_id || true)" ;;
  esac
done

if [[ -n "${TICKET:-}" ]]; then call GET "/api/agent/customers/$ID/tickets/$TICKET"; fi
if [[ -n "${ORDER:-}" ]]; then call GET "/api/agent/customers/$ID/orders/$ORDER"; fi

if [[ "$WRITE" != "1" ]]; then
  echo
  echo "Read-only pass finished. Re-run with WRITE=1 to create a ticket, complaint, and service request."
  echo "These are not called by default: POST customers, PATCH, DELETE, verify, quotes, notice read."
  exit 0
fi

call POST "/api/agent/customers/$ID/tickets" '{"subject":"API curl check","body":"Created by scripts/curl-api.sh","category":"other","severity":"low"}'
call POST "/api/agent/customers/$ID/complaints" '{"kind":"service","subject":"API curl check","body":"Created by scripts/curl-api.sh"}'
call POST "/api/agent/customers/$ID/services" '{"offering":"network","site":"Main office","notes":"API curl check"}'
if [[ -n "${NOTICE:-}" ]]; then call POST "/api/agent/customers/$ID/notices/$NOTICE/read"; fi
