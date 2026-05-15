# Architecture

## Overview

The application is split into a React frontend and an Express backend. The frontend handles screens, forms, filters, and visual SLA indicators. The backend owns validation, database access, ticket workflow rules, activity logging, and SLA calculations.

## Project Structure

- `frontend/` contains the Vite React app, reusable components, pages, styles, and API client.
- `backend/` contains the Express server, route handlers, SQLite schema, seed script, middleware, and services.
- `docs/` contains internal explanations for the database, SLA logic, API, and core concepts.

## Technology Choices

React is used because ticket queues, filters, forms, and detail views benefit from reusable components and state-driven updates.

Node.js and Express are used because they provide a straightforward way to build REST endpoints with clear route files and middleware.

SQLite is used because it is lightweight, file-based, and easy to reset while still using real relational tables and SQL queries.

## Data Flow

1. A user interacts with a React page, such as creating a ticket or adding a note.
2. The frontend API client sends a request to an Express endpoint under `/api`.
3. The route validates the request and reads or writes SQLite records.
4. Workflow routes create activity log entries for important changes.
5. Ticket responses include computed SLA details from the SLA service.
6. React stores the response in component state and re-renders the page.

## Backend Responsibilities

- Validate required fields and allowed values.
- Store ticket workflow data.
- Set `first_response_at` when a ticket receives its first response.
- Set `resolved_at` when a ticket is resolved.
- Store escalation history separately from the current ticket status.
- Return meaningful HTTP status codes and error messages.

## Frontend Responsibilities

- Present dashboard, list, detail, create, and report views.
- Keep forms controlled with React state.
- Show loading, empty, and error states.
- Use badges and simple visual hierarchy to make priority, status, and SLA state easy to scan.
