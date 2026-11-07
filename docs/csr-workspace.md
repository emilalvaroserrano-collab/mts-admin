# Sarah CSR workspace

This change extends the existing portal and the `mts-agent` LiveKit worker. Deploy the matching branches together; the release order below prevents an old API from accepting newly scoped sessions.

## Delivered behavior

| Upgrade | Implementation |
| --- | --- |
| Customer permissions | Portal-bound, expiring `csr_` credentials; session revocation follows portal logout/token rotation. Agent API enforces customer grants, including invoice eligibility, without staff-key purchase bypasses. |
| Customer context | Account support profile, contacts, sites, equipment, read-only access/policy, and service status. Customer preferences and staff-managed policy have separate write paths. |
| Zendesk continuity | Agent replies/resolution/escalation update the existing Zendesk ticket. Unlinked tickets remain queued; remote failures are not reported as synchronized. |
| Service fulfillment | Structured quantity, owned site, assigned users, recipients, handset SKU, accepted terms, monthly reference amount, provider reference, and validated state transitions. |
| Reliable actions | Server-generated review sheets bind customer, method, exact path/body, current quoted price, and terms. Atomic claim prevents duplicate execution. Uncertain writes enter manual review. |
| Billing | Normalized, signed billing-source ingestion with replay protection, freshness checks, per-customer documents, balances, due dates, and recurring service requests. No accounting feed means the agent reports the balance as unavailable. |
| History | Durable customer-scoped conversations/messages, stable message identifiers, history pagination, and recent conversation restoration in the worker. |
| Notifications | Database status-change triggers create in-app notices and a durable push outbox. Delivery respects device subscriptions, timezone, quiet hours, retries, and expired subscriptions. |
| Knowledge | Staff approves organization-scoped or shared guides. Sarah searches only approved guides accessible to the current organization. |
| Voice and portal UX | Aoede/Gemini Live defaults, configurable voice/model, short introductions, consistent Sarah persona, page context, actual portal-navigation acknowledgment, review sheets, and receipts. |

## Staff workflow

The **Sarah workspace** menu (`/csr`) is restricted server-side to active administrators/owners. Administrators assigned to an organization can manage only that organization's customers. Select a customer to maintain purchasing limits, PO requirements, approvers, payment terms, support agreement, equipment register, service fulfillment, and approved guidance.

Purchases above the configured approval threshold are blocked for staff review; this release does not claim to automate external approver signatures. A handset request does not itself place a handset order. Provider activation is recorded only with a confirmation reference.

## Release order

1. Back up the database through the database provider. Deploy the portal branch first. Its build applies additive migration `0037_csr_workspace.sql`.
2. Deploy the matching `mts-agent` web console and Python worker. They use the scoped token returned by the redeemed one-time portal handoff. Keep staff credentials out of the frontend.
3. Configure exact portal embedding origins in the agent web app's `NEXT_PUBLIC_MTS_PORTAL_ORIGINS` and the portal API origin in `MTS_API_BASE_URL`.
4. Verify all three customer access levels end-to-end with dedicated test accounts: support only, approved pay-now purchasing, and authorized services/invoice access.
5. Configure external integrations below, then test one real ticket round trip, one test payment, one service-provider event, and one device notification before promoting the release.

Rollback: revert the application commits together and stop the new job schedule. Leave additive tables/columns in place to retain conversation and action history; do not drop customer data as part of rollback.

## Required integration configuration

| Variable / connection | Location | Purpose |
| --- | --- | --- |
| Existing Zendesk connection | Portal | Existing Support API credentials/OAuth, webhook, and ticket-copy job runner. Test against a sandbox Zendesk account. |
| Existing payment connection | Portal | Secure hosted checkout and verified payment updates. Order creation never marks a card payment successful. |
| `CSR_EVENTS_SECRET` | Portal server | HMAC secret for normalized billing/provider events. Use a new high-entropy value; configure the upstream automation with the same value. |
| `CSR_VAPID_PUBLIC_KEY`, `CSR_VAPID_PRIVATE_KEY`, `CSR_VAPID_SUBJECT` | Portal server | Web Push signing keys and a `mailto:` or HTTPS subject. Generate a keypair with the installed `web-push` package. The private key stays server-side. |
| `CRON_SECRET` | Portal server | Authenticates the push-outbox job. Missing secret fails closed. |
| Job schedule | Hosting/queue | Invoke `GET /api/csr-jobs` regularly with `Authorization: Bearer <CRON_SECRET>`. Delivery is server-side and survives browser closure. |
| LiveKit settings | Worker + agent web app | Both deployments must use the same LiveKit project. |
| `CSR_REALTIME_MODEL`, `CSR_VOICE` | Python worker | Defaults: `google/gemini-live`, `Aoede`. LiveKit Inference provides the model connection. |
| `MTS_OPERATOR_KEY`, `MTS_OPERATOR_EMAIL_ALLOWLIST` | Python worker, staff mode only | Optional trusted staff dispatch. Customer sessions do not fall back to this key. |

Device subscription is available on the portal Account page, where permission can be requested in the portal's own browser context. The call screen also offers subscription for standalone use. Background live audio depends on browser/OS behavior; durable history, notices, and server-side push are the recovery path after suspension.

## Billing and provider event contract

POST JSON to `/api/csr-events`. Headers:

- `X-MTS-Timestamp`: Unix milliseconds or seconds, within five minutes.
- `X-MTS-Signature`: lowercase hex HMAC-SHA256 of `<timestamp>.<exact raw JSON body>`, using `CSR_EVENTS_SECRET`.

The current accounting/provider platform must send this normalized contract through its webhook or integration automation. This is an ingestion adapter, not an assertion that QuickBooks, Telxent, or any other external account is already connected.

Billing document example (use the actual mapped portal customer ID):

```json
{"type":"billing.document","source":"accounting-system","eventId":"unique-event-id","customerId":42,"externalId":"invoice-provider-id","number":"INV-1001","currency":"USD","totalCents":18000,"outstandingCents":18000,"dueDate":"2026-12-01","status":"open","updatedAt":"2026-11-07T15:00:00Z"}
```

Service-provider confirmation example:

```json
{"type":"service.status","source":"phone-provider","eventId":"unique-provider-event","customerId":42,"requestId":123,"status":"active","providerReference":"provider-confirmation-id"}
```

Follow the state machine: `requested → approved → provider_pending → scheduled → active` (provider-pending may proceed directly to active with a provider reference). Staff can also record these transitions in the Sarah workspace. Duplicate events do not execute twice; older billing snapshots do not overwrite newer balances.

## Verification

- `npm test` includes the PGLite migration/integration suite in `scripts/csr-workspace.test.mjs`.
- `npm run typecheck` and `npm run build` validate the portal and generated route tree.
- In the worker repo: `uv run pytest`, `uv run ruff check src tests`, `npm --prefix web run typecheck`, `npm --prefix web run lint:web`, and `npm --prefix web run build`.
- LiveKit scenario tests require a configured non-production project: `lk agent simulate text --scenarios scenarios.yaml`.

No live provider credentials, paid calls, real messages, or production writes are needed for the local integration suite. Live acceptance remains a separate release gate.
