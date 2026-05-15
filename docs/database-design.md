# Database Design

## Tables

### technicians

Stores support staff that can be assigned to tickets.

Example:

```json
{
  "id": 1,
  "name": "Avery Chen",
  "email": "avery.chen@example.local",
  "team": "Service Desk",
  "is_active": 1
}
```

### tickets

Stores the current state and main details for each support request.

Important fields:

- `priority` controls SLA targets.
- `status` tracks the workflow state.
- `assigned_technician_id` links to `technicians`.
- `first_response_at` is set when troubleshooting begins.
- `resolved_at` is set when the ticket is resolved.
- `resolution_summary` records final resolution steps.

Example:

```json
{
  "id": 4,
  "category": "Payroll/internal tools",
  "title": "Payroll upload error on batch validation",
  "priority": "Critical",
  "status": "Escalated"
}
```

### notes

Stores troubleshooting notes. A ticket can have many notes.

Example:

```json
{
  "ticket_id": 1,
  "author": "Service Desk",
  "note_text": "Initial review completed and troubleshooting started."
}
```

### activity_logs

Stores important workflow actions, such as creation, updates, notes, escalations, and resolution.

Example:

```json
{
  "ticket_id": 1,
  "action": "Ticket updated",
  "actor": "Service Desk",
  "details": "Updated status."
}
```

### escalations

Stores escalation history. A ticket can be escalated more than once over time.

Example:

```json
{
  "ticket_id": 4,
  "reason": "Business process is blocked and needs specialist review.",
  "escalated_by": "Avery Chen"
}
```

## Relationships

- `tickets.assigned_technician_id` references `technicians.id`.
- `notes.ticket_id` references `tickets.id`.
- `activity_logs.ticket_id` references `tickets.id`.
- `escalations.ticket_id` references `tickets.id`.

Notes, activity logs, and escalations are deleted automatically if their ticket is deleted. The current app does not expose ticket deletion, but the relationship keeps the database consistent.
