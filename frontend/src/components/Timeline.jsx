import React from "react";
import { formatDateTime } from "../format.js";

export default function Timeline({ activity }) {
  if (!activity?.length) {
    return <div className="empty-state">No activity has been recorded yet.</div>;
  }

  return (
    <ol className="timeline">
      {activity.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.action}</strong>
            <span>{formatDateTime(item.created_at)}</span>
          </div>
          <p>{item.details}</p>
          <small>{item.actor}</small>
        </li>
      ))}
    </ol>
  );
}
