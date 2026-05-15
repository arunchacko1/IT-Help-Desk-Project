# Learning Notes

## REST APIs

A REST API exposes predictable URLs for working with data. In this app, `/api/tickets` is the main ticket collection, and `/api/tickets/:id` refers to one ticket.

## CRUD

CRUD means create, read, update, and delete. This app creates tickets, reads tickets, and updates ticket workflow data. It does not expose deletion in the interface.

## SQLite

SQLite stores data in a local file. The app uses real SQL tables while keeping setup simple because no separate database server is required.

## Express Routing

Express route files group related endpoints. Ticket workflow endpoints live in `backend/src/routes/tickets.js`, technician endpoints live in `technicians.js`, and reporting endpoints live in `reports.js`.

## React Components

React components are reusable pieces of UI. Badges, tables, filters, timelines, and pages are all components in this project.

## React State

State stores values that can change while the app is running, such as form inputs, selected filters, loaded tickets, and error messages.

## useEffect

`useEffect` runs code after a component renders. This app uses it to load tickets, technicians, and report data from the API when pages open or filters change.

## API Calls from the Frontend

The frontend API client wraps `fetch` calls in `frontend/src/api/client.js`. Pages call the client instead of repeating URL and error-handling code.

## Basic Validation

The backend validates required fields, email shape, priority values, status values, and category values. Server-side validation protects data even if a frontend form changes.

## Activity Logging

Activity logging creates a timeline of important ticket actions. This makes it easier to understand what happened, who acted, and when the workflow changed.
