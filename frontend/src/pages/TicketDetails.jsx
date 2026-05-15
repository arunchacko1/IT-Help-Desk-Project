import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import PriorityBadge from "../components/PriorityBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SlaBadge from "../components/SlaBadge.jsx";
import Timeline from "../components/Timeline.jsx";
import { priorities, statuses } from "../constants.js";
import { formatDateTime } from "../format.js";

export default function TicketDetails({ ticketId }) {
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [note, setNote] = useState({ author: "", note_text: "" });
  const [escalation, setEscalation] = useState({ escalated_by: "", reason: "" });
  const [resolution, setResolution] = useState({ actor: "", resolution_summary: "" });
  const [error, setError] = useState("");

  function load() {
    return Promise.all([api.getTicket(ticketId), api.getTechnicians()])
      .then(([ticketData, techData]) => {
        setTicket(ticketData);
        setTechnicians(techData);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [ticketId]);

  async function updateTicket(body) {
    setError("");
    try {
      await api.updateTicket(ticketId, { ...body, actor: body.actor || "Service Desk" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addNote(event) {
    event.preventDefault();
    try {
      await api.addNote(ticketId, note);
      setNote({ author: "", note_text: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function escalate(event) {
    event.preventDefault();
    try {
      await api.escalateTicket(ticketId, escalation);
      setEscalation({ escalated_by: "", reason: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function resolve(event) {
    event.preventDefault();
    try {
      await api.resolveTicket(ticketId, resolution);
      setResolution({ actor: "", resolution_summary: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !ticket) return <div className="alert">{error}</div>;
  if (!ticket) return <div className="loading">Loading ticket...</div>;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Ticket #{ticket.id}</p>
          <h2>{ticket.title}</h2>
        </div>
        <a className="button secondary" href="#/tickets">Back to Tickets</a>
      </header>
      {error && <div className="alert">{error}</div>}

      <section className="detail-grid">
        <div className="panel">
          <div className="ticket-title-row">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <SlaBadge status={ticket.sla.overallStatus} />
          </div>
          <p>{ticket.description}</p>
          <dl className="details-list">
            <div><dt>Requester</dt><dd>{ticket.requester_name} ({ticket.requester_email})</dd></div>
            <div><dt>Department/location</dt><dd>{ticket.department_location}</dd></div>
            <div><dt>Category</dt><dd>{ticket.category}</dd></div>
            <div><dt>Technician</dt><dd>{ticket.assigned_technician || "Unassigned"}</dd></div>
            <div><dt>Created</dt><dd>{formatDateTime(ticket.created_at)}</dd></div>
            <div><dt>Updated</dt><dd>{formatDateTime(ticket.updated_at)}</dd></div>
          </dl>
        </div>

        <div className="panel">
          <h3>SLA Tracking</h3>
          <dl className="details-list">
            <div><dt>Response target</dt><dd>{ticket.sla.responseTarget} by {formatDateTime(ticket.sla.responseDue)}</dd></div>
            <div><dt>Resolution target</dt><dd>{ticket.sla.resolutionTarget} by {formatDateTime(ticket.sla.resolutionDue)}</dd></div>
            <div><dt>Response status</dt><dd>{ticket.sla.responseStatus}</dd></div>
            <div><dt>Resolution status</dt><dd>{ticket.sla.resolutionStatus}</dd></div>
          </dl>
        </div>
      </section>

      <section className="panel">
        <h3>Ticket Controls</h3>
        <div className="control-grid">
          <label>
            Status
            <select value={ticket.status} onChange={(event) => updateTicket({ status: event.target.value })}>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Priority
            <select value={ticket.priority} onChange={(event) => updateTicket({ priority: event.target.value })}>
              {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </label>
          <label>
            Technician
            <select
              value={ticket.assigned_technician_id || ""}
              onChange={(event) => updateTicket({ assigned_technician_id: event.target.value || null })}
            >
              <option value="">Unassigned</option>
              {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="detail-grid">
        <form className="panel compact-form" onSubmit={addNote}>
          <h3>Troubleshooting Note</h3>
          <input placeholder="Technician name" value={note.author} onChange={(event) => setNote({ ...note, author: event.target.value })} />
          <textarea rows="4" placeholder="Note text" value={note.note_text} onChange={(event) => setNote({ ...note, note_text: event.target.value })} />
          <button>Add Note</button>
        </form>

        <form className="panel compact-form" onSubmit={escalate}>
          <h3>Escalation</h3>
          <input placeholder="Escalated by" value={escalation.escalated_by} onChange={(event) => setEscalation({ ...escalation, escalated_by: event.target.value })} />
          <textarea rows="4" placeholder="Escalation reason" value={escalation.reason} onChange={(event) => setEscalation({ ...escalation, reason: event.target.value })} />
          <button>Escalate Ticket</button>
        </form>
      </section>

      <form className="panel compact-form" onSubmit={resolve}>
        <h3>Resolution Summary</h3>
        <input placeholder="Resolved by" value={resolution.actor} onChange={(event) => setResolution({ ...resolution, actor: event.target.value })} />
        <textarea rows="4" placeholder="Final resolution steps" value={resolution.resolution_summary} onChange={(event) => setResolution({ ...resolution, resolution_summary: event.target.value })} />
        <button>Resolve Ticket</button>
      </form>

      <section className="detail-grid">
        <div className="panel">
          <h3>Notes</h3>
          {ticket.notes.length ? ticket.notes.map((item) => (
            <article className="note" key={item.id}>
              <strong>{item.author}</strong>
              <span>{formatDateTime(item.created_at)}</span>
              <p>{item.note_text}</p>
            </article>
          )) : <div className="empty-state">No notes yet.</div>}
        </div>
        <div className="panel">
          <h3>Activity Timeline</h3>
          <Timeline activity={ticket.activity} />
        </div>
      </section>
    </div>
  );
}
