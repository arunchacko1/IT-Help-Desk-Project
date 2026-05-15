# IT Help Desk Ticketing & SLA Tracker

A full-stack IT service desk application for creating, assigning, escalating, tracking, and resolving support tickets. The app includes SLA visibility, troubleshooting notes, escalation history, activity logs, reporting summaries, and realistic fictional sample data.

## Features

- Create support tickets with requester, category, priority, assignment, and issue details.
- View and filter the ticket queue by status, priority, category, technician, and search text.
- Open ticket details to update status, change priority, assign technicians, add troubleshooting notes, escalate tickets, and record resolution summaries.
- Track response and resolution SLA status as Within SLA, At Risk, or Breached.
- Review ticket timelines with activity history.
- View reporting totals and simple breakdowns by category, priority, status, and SLA state.

## Tech Stack

- React and Vite for the frontend
- Node.js and Express for the API
- SQLite for local data storage
- Plain CSS for styling

## Setup

Install dependencies from the project root:

```bash
npm run install:all
```

Create and seed the SQLite database:

```bash
npm run seed
```

Run the backend:

```bash
npm run dev:backend
```

Run the frontend in a second terminal:

```bash
npm run dev:frontend
```

The API runs on `http://localhost:4000`. The Vite dev server prints the frontend URL, usually `http://127.0.0.1:5173`.

## Database

The schema is stored in `backend/src/db/schema.sql`. The seed script creates technicians, tickets, notes, escalations, and activity log entries in `backend/data/helpdesk.sqlite`.

Run the seed script again whenever you want to reset the sample data:

```bash
npm run seed
```

## Screenshots

Add screenshots here after running the app locally:

- Dashboard
- Ticket list
- Ticket detail workflow
- Reports

## Documentation

- [Architecture](docs/architecture.md)
- [Database Design](docs/database-design.md)
- [SLA Logic](docs/sla-logic.md)
- [API Reference](docs/api-reference.md)
- [Learning Notes](docs/learning-notes.md)

## Future Improvements

- Add user and technician authentication.
- Add email notifications for escalations and SLA risk.
- Add attachment support for screenshots and logs.
- Add export options for reports.
- Add more advanced business-hour calendars and holiday handling.
