import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import TicketTable from "../components/TicketTable.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getReportSummary(), api.getTickets()])
      .then(([report, ticketRows]) => {
        setSummary(report);
        setTickets(ticketRows.slice(0, 6));
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!summary) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h2>Dashboard</h2>
        </div>
        <a className="button" href="#/create">New Ticket</a>
      </header>

      <section className="metric-grid">
        <Metric label="Total Tickets" value={summary.totals.totalTickets} />
        <Metric label="Open Tickets" value={summary.totals.openTickets} />
        <Metric label="Escalated" value={summary.totals.escalatedTickets} />
        <Metric label="Resolved" value={summary.totals.resolvedTickets} />
        <Metric label="SLA Breaches" value={summary.totals.slaBreaches} tone="danger" />
      </section>

      <section className="panel">
        <div className="section-heading">
          <h3>Recent Ticket Activity</h3>
          <a href="#/tickets">View all</a>
        </div>
        <TicketTable tickets={tickets} />
      </section>
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className={`metric ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
