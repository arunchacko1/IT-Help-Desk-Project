import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getReportSummary().then(setSummary).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!summary) return <div className="loading">Loading reports...</div>;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Service metrics</p>
          <h2>Reports</h2>
        </div>
      </header>
      <section className="metric-grid">
        <Metric label="Total Tickets" value={summary.totals.totalTickets} />
        <Metric label="Open Tickets" value={summary.totals.openTickets} />
        <Metric label="Escalated" value={summary.totals.escalatedTickets} />
        <Metric label="Resolved" value={summary.totals.resolvedTickets} />
        <Metric label="SLA Breaches" value={summary.totals.slaBreaches} tone="danger" />
      </section>
      <section className="report-grid">
        <Breakdown title="By Category" data={summary.breakdowns.category} />
        <Breakdown title="By Priority" data={summary.breakdowns.priority} />
        <Breakdown title="By Status" data={summary.breakdowns.status} />
        <Breakdown title="By SLA" data={summary.breakdowns.sla} />
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

function Breakdown({ title, data }) {
  const rows = Object.entries(data);
  const max = Math.max(...rows.map(([, value]) => value), 1);
  return (
    <div className="panel">
      <h3>{title}</h3>
      <div className="breakdown">
        {rows.map(([label, value]) => (
          <div className="bar-row" key={label}>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <div className="bar-track"><span style={{ width: `${(value / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
