import React from "react";
import PriorityBadge from "./PriorityBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";
import SlaBadge from "./SlaBadge.jsx";
import { formatDate } from "../format.js";

export default function TicketTable({ tickets }) {
  if (!tickets.length) {
    return <div className="empty-state">No tickets match the current view.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Requester</th>
            <th>Technician</th>
            <th>Created</th>
            <th>SLA</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>#{ticket.id}</td>
              <td>
                <a className="table-link" href={`#/tickets/${ticket.id}`}>{ticket.title}</a>
                {ticket.status === "Escalated" && <span className="inline-flag">Escalated</span>}
              </td>
              <td><PriorityBadge priority={ticket.priority} /></td>
              <td><StatusBadge status={ticket.status} /></td>
              <td>{ticket.requester_name}</td>
              <td>{ticket.assigned_technician || "Unassigned"}</td>
              <td>{formatDate(ticket.created_at)}</td>
              <td><SlaBadge status={ticket.sla.overallStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
