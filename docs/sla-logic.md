# SLA Logic

## Priority Targets

| Priority | Response Target | Resolution Target |
|---|---:|---:|
| Critical | 1 hour | 4 hours |
| High | 4 hours | 1 business day |
| Medium | 1 business day | 3 business days |
| Low | 2 business days | 5 business days |

## Response SLA

Response SLA measures the time from `tickets.created_at` to `tickets.first_response_at`.

The application sets `first_response_at` automatically when:

- the first troubleshooting note is added, or
- the status is first changed to `In Progress`.

If the response due time passes before `first_response_at` exists, the response SLA is breached.

## Resolution SLA

Resolution SLA measures the time from `tickets.created_at` to `tickets.resolved_at`.

The application sets `resolved_at` when the ticket is resolved through the resolution endpoint or when status changes to `Resolved`.

If the resolution due time passes before `resolved_at` exists, the resolution SLA is breached.

## SLA States

- `Within SLA`: response and resolution targets are still healthy or were completed before their due time.
- `At Risk`: an incomplete response or resolution target has 25% or less of its total target window remaining.
- `Breached`: response or resolution happened after the due time, or the due time has passed and the required timestamp is still missing.

The overall ticket SLA status uses the most urgent state. A breach takes priority over at-risk, and at-risk takes priority over within SLA.

## Business-Day Assumptions

Business-day targets skip Saturday and Sunday. The current implementation does not model holidays or custom working hours. Hour-based targets use normal elapsed time.

## Edge Cases

- Resolved and closed tickets keep their final SLA result based on actual response and resolution timestamps.
- If a ticket is closed without a `resolved_at` value, the application uses the ticket update time as a fallback for SLA evaluation.
- Changing priority recalculates SLA due times from the original created time.
- Escalation does not pause SLA timers.
