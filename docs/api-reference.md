# API Reference

Base URL: `/api`

Errors use this shape:

```json
{
  "error": "Validation failed",
  "details": ["title is required"]
}
```

## Health

### GET `/api/health`

Returns server status.

```json
{
  "data": {
    "status": "ok"
  }
}
```

## Technicians

### GET `/api/technicians`

Returns active technicians.

```json
{
  "data": [
    {
      "id": 1,
      "name": "Avery Chen",
      "email": "avery.chen@example.local",
      "team": "Service Desk"
    }
  ]
}
```

## Tickets

### GET `/api/tickets`

Optional query parameters:

- `status`
- `priority`
- `category`
- `technicianId`
- `search`

Returns tickets with computed SLA details.

### GET `/api/tickets/:id`

Returns a ticket with notes, escalations, activity, and SLA details.

### POST `/api/tickets`

Creates a ticket.

```json
{
  "requester_name": "Nina Alvarez",
  "requester_email": "nina.alvarez@example.local",
  "department_location": "Finance - HQ 3rd Floor",
  "category": "Account access",
  "title": "Locked account",
  "description": "Requester cannot access the finance portal.",
  "priority": "High",
  "assigned_technician_id": 1
}
```

Possible responses:

- `201` created
- `400` validation failed

### PATCH `/api/tickets/:id`

Updates editable ticket fields.

```json
{
  "status": "In Progress",
  "actor": "Avery Chen"
}
```

Possible responses:

- `200` updated
- `400` validation failed
- `404` ticket not found

### POST `/api/tickets/:id/notes`

Adds a troubleshooting note.

```json
{
  "author": "Avery Chen",
  "note_text": "Confirmed account lockout and started identity verification."
}
```

### POST `/api/tickets/:id/escalations`

Escalates a ticket and stores the escalation reason.

```json
{
  "escalated_by": "Avery Chen",
  "reason": "Access issue is blocking payroll processing."
}
```

### POST `/api/tickets/:id/resolve`

Resolves a ticket with a final summary.

```json
{
  "actor": "Avery Chen",
  "resolution_summary": "Verified identity, reset access, and confirmed successful sign-in."
}
```

## Reports

### GET `/api/reports/summary`

Returns totals and breakdowns.

```json
{
  "data": {
    "totals": {
      "totalTickets": 7,
      "openTickets": 4,
      "escalatedTickets": 1,
      "resolvedTickets": 2,
      "slaBreaches": 2
    },
    "breakdowns": {
      "category": {},
      "priority": {},
      "status": {},
      "sla": {}
    }
  }
}
```
